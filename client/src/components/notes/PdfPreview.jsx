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

export default function PdfPreview({ noteId, title }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageRendering, setPageRendering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const loadTaskRef = useRef(null);

  useEffect(
    function () {
      let cancelled = false;
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
      setPdfDoc(function (previousDoc) {
        if (previousDoc) {
          previousDoc.destroy();
        }
        return null;
      });

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      axiosClient
        .get('/notes/' + noteId + '/preview', {
          responseType: 'arraybuffer',
          signal: controller.signal
        })
        .then(function (res) {
          if (cancelled) {
            return null;
          }

          const bytes = new Uint8Array(res.data);
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
          if (cancelled) {
            doc.destroy();
            return;
          }

          setPdfDoc(doc);
          setNumPages(doc.numPages);
        })
        .catch(function (err) {
          if (cancelled || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
            return;
          }
          setError(err.message || 'Failed to load preview');
        })
        .finally(function () {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return function () {
        cancelled = true;
        controller.abort();

        if (loadTaskRef.current) {
          loadTaskRef.current.destroy();
          loadTaskRef.current = null;
        }
      };
    },
    [noteId, retryCount]
  );

  useEffect(function () {
    const el = viewportRef.current;
    if (!el) {
      return undefined;
    }

    function measure() {
      const width = el.clientWidth;
      setContainerWidth(function (previousWidth) {
        return Math.abs(previousWidth - width) > 1 ? width : previousWidth;
      });
    }

    measure();

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(function () {
        measure();
      });
      observer.observe(el);
    }

    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    return function () {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  useEffect(
    function () {
      if (!pdfDoc || !containerWidth) {
        return undefined;
      }

      let cancelled = false;
      setPageRendering(true);

      pdfDoc
        .getPage(currentPage)
        .then(function (page) {
          if (cancelled) {
            return null;
          }

          const unscaledViewport = page.getViewport({ scale: 1 });
          const fitScale = containerWidth / unscaledViewport.width;
          const scale = Math.min(Math.max(fitScale, MIN_SCALE), MAX_SCALE);
          const viewport = page.getViewport({ scale: scale });

          const canvas = canvasRef.current;
          if (!canvas) {
            return null;
          }

          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Preview canvas is not available in this browser.');
          }

          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + 'px';
          canvas.style.height = Math.floor(viewport.height) + 'px';

          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          const renderTask = page.render({
            canvasContext: context,
            viewport: viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
          });
          renderTaskRef.current = renderTask;
          return renderTask.promise;
        })
        .then(function () {
          if (!cancelled) {
            setPageRendering(false);
          }
        })
        .catch(function (err) {
          if (cancelled || (err && err.name === 'RenderingCancelledException')) {
            return;
          }
          setPageRendering(false);
          setError(err.message || 'Failed to render this page.');
        });

      return function () {
        cancelled = true;
      };
    },
    [pdfDoc, currentPage, containerWidth]
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

  function goToPage(next) {
    setCurrentPage(function () {
      return Math.min(Math.max(next, 1), numPages || 1);
    });
  }

  return (
    <div className="relative bg-surface-high rounded-xl overflow-hidden border border-border-subtle h-[70vh] lg:h-[750px] flex flex-col">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Spinner size="lg" label="Loading preview..." />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      ) : (
        <React.Fragment>
          <div ref={viewportRef} className="flex-1 overflow-auto flex items-start justify-center p-4">
            {numPages ? (
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={(title || 'Note preview') + ' - page ' + currentPage + ' of ' + numPages}
                className="shadow-sm bg-white"
              />
            ) : null}
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
