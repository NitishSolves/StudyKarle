import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
import axiosClient from '../../api/axiosClient';
import Spinner from '../common/Spinner';
import ErrorState from '../common/ErrorState';
import { getPreviewUrl } from '../../api/notesApi';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

const MIN_SCALE = 0.35;
const MAX_SCALE = 3;
const MAX_DEVICE_PIXEL_RATIO = 2;

function canRenderPdfInBrowser() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  if (typeof Promise === 'undefined' || typeof Uint8Array === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  return !!(canvas && canvas.getContext && canvas.getContext('2d'));
}

function getPdfErrorMessage(error) {
  if (!error) {
    return 'Failed to load preview.';
  }

  if (error.name === 'InvalidPDFException') {
    return 'This file is not a valid PDF.';
  }

  if (error.name === 'MissingPDFException') {
    return 'This PDF file could not be found.';
  }

  if (error.name === 'UnexpectedResponseException') {
    return 'Unable to fetch this PDF right now. Please try again.';
  }

  return error.message || 'Failed to load preview.';
}

export default function PdfPreview({ noteId, title }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const loadTaskRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(
    function () {
      let active = true;
      const controller = new AbortController();

      if (!canRenderPdfInBrowser()) {
        setLoading(false);
        setError('PDF preview is not supported in this browser. Please open it in a new tab or download it.');
        return function () {};
      }

      setLoading(true);
      setError(null);
      setNumPages(0);
      setCurrentPage(1);

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (loadTaskRef.current) {
        loadTaskRef.current.destroy();
        loadTaskRef.current = null;
      }

      setPdfDoc(function (previousDoc) {
        if (previousDoc) {
          previousDoc.destroy();
        }
        return null;
      });

      axiosClient
        .get('/notes/' + noteId + '/preview', {
          responseType: 'arraybuffer',
          signal: controller.signal
        })
        .then(function (response) {
          if (!active) {
            return null;
          }

          const bytes = new Uint8Array(response.data || []);
          if (!bytes.length) {
            throw new Error('This file appears to be empty or unavailable.');
          }

          const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
          if (header !== '%PDF-') {
            throw new Error('This file is not a valid PDF.');
          }

          loadTaskRef.current = pdfjsLib.getDocument({ data: bytes });
          return loadTaskRef.current.promise;
        })
        .then(function (doc) {
          if (!doc) {
            return;
          }

          if (!active) {
            doc.destroy();
            return;
          }

          setPdfDoc(doc);
          setNumPages(doc.numPages || 0);
        })
        .catch(function (loadError) {
          if (!active || loadError.name === 'CanceledError' || loadError.code === 'ERR_CANCELED') {
            return;
          }

          setError(getPdfErrorMessage(loadError));
        })
        .finally(function () {
          if (active) {
            setLoading(false);
          }
        });

      return function () {
        active = false;
        controller.abort();

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        if (loadTaskRef.current) {
          loadTaskRef.current.destroy();
          loadTaskRef.current = null;
        }
      };
    },
    [noteId, retryCount]
  );

  useEffect(function () {
    const viewportElement = viewportRef.current;
    if (!viewportElement) {
      return undefined;
    }

    function updateSize() {
      const nextWidth = viewportElement.clientWidth;
      const nextHeight = viewportElement.clientHeight;

      setViewportSize(function (previousSize) {
        if (
          Math.abs(previousSize.width - nextWidth) <= 1 &&
          Math.abs(previousSize.height - nextHeight) <= 1
        ) {
          return previousSize;
        }

        return {
          width: nextWidth,
          height: nextHeight
        };
      });
    }

    updateSize();

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateSize);
      observer.observe(viewportElement);
    }

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return function () {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  useEffect(
    function () {
      if (!pdfDoc || !viewportSize.width || !viewportSize.height) {
        return undefined;
      }

      let active = true;

      async function renderCurrentPage() {
        setPageRendering(true);
        setError(null);

        try {
          const page = await pdfDoc.getPage(currentPage);
          if (!active) {
            return;
          }

          const unscaledViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.max(viewportSize.width - 24, 1);
          const targetHeight = Math.max(viewportSize.height - 24, 1);
          const widthScale = targetWidth / unscaledViewport.width;
          const heightScale = targetHeight / unscaledViewport.height;
          const fitScale = Math.min(widthScale, heightScale);
          const scale = Math.min(Math.max(fitScale, MIN_SCALE), MAX_SCALE);
          const viewport = page.getViewport({ scale: scale });

          const canvas = canvasRef.current;
          if (!canvas) {
            return;
          }

          const context = canvas.getContext('2d', { alpha: false });
          if (!context) {
            throw new Error('Preview canvas is not available in this browser.');
          }

          const outputScale = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + 'px';
          canvas.style.height = Math.floor(viewport.height) + 'px';

          context.setTransform(1, 0, 0, 1, 0, 0);
          context.clearRect(0, 0, canvas.width, canvas.height);

          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          const renderTask = page.render({
            canvasContext: context,
            viewport: viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
          });

          renderTaskRef.current = renderTask;
          await renderTask.promise;
        } catch (renderError) {
          if (!active || (renderError && renderError.name === 'RenderingCancelledException')) {
            return;
          }

          setError(getPdfErrorMessage(renderError));
        } finally {
          if (active) {
            setPageRendering(false);
          }
        }
      }

      renderCurrentPage();

      return function () {
        active = false;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
      };
    },
    [pdfDoc, currentPage, viewportSize.width, viewportSize.height]
  );

  useEffect(
    function () {
      if (!numPages) {
        return;
      }

      setCurrentPage(function (page) {
        return Math.min(Math.max(page, 1), numPages);
      });
    },
    [numPages]
  );

  useEffect(function () {
    return function () {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (loadTaskRef.current) {
        loadTaskRef.current.destroy();
      }
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfDoc]);

  function handleRetry() {
    setRetryCount(function (count) {
      return count + 1;
    });
  }

  function goToPage(nextPage) {
    setCurrentPage(function () {
      return Math.min(Math.max(nextPage, 1), numPages || 1);
    });
  }

  return (
    <div className="relative bg-surface-high rounded-xl overflow-hidden border border-border-subtle h-[70vh] lg:h-[750px] flex flex-col">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Spinner size="lg" label="Loading preview..." />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white p-4">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      ) : (
        <React.Fragment>
          <div ref={viewportRef} className="relative flex-1 min-h-0 overflow-auto bg-surface-high">
            <div className="min-w-full min-h-full flex items-center justify-center p-3 sm:p-4">
              {numPages ? (
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={(title || 'Note preview') + ' - page ' + currentPage + ' of ' + numPages}
                  className="block shadow-sm bg-white"
                />
              ) : null}
            </div>

            {pageRendering ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Spinner size="md" />
              </div>
            ) : null}
          </div>

          {numPages ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border-subtle bg-white shrink-0">
              <button
                type="button"
                onClick={function () {
                  goToPage(currentPage - 1);
                }}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-low"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  chevron_left
                </span>
              </button>

              <span className="text-body-sm text-text-secondary">
                Page {currentPage} of {numPages}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={getPreviewUrl(noteId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open PDF in a new tab"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-text-primary hover:bg-surface-low"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    open_in_new
                  </span>
                </a>
                <button
                  type="button"
                  onClick={function () {
                    goToPage(currentPage + 1);
                  }}
                  disabled={currentPage >= numPages}
                  aria-label="Next page"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-low"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          ) : null}
        </React.Fragment>
      )}
    </div>
  );
}
