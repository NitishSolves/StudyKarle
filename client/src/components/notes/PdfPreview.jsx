import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import axiosClient from '../../api/axiosClient';
import Spinner from '../common/Spinner';
import ErrorState from '../common/ErrorState';
import { getPreviewUrl } from '../../api/notesApi';

// Rendering PDFs via <iframe src={blobUrl}> depends entirely on the browser's
// own built-in PDF viewer. Desktop Chrome/Firefox/Edge/Safari all ship one,
// so it "works". Mobile Chrome and most in-app WebViews do not - they try to
// hand the file to an external viewer app, which is impossible for a blob:
// URL (it only exists inside this tab's JS context), so the iframe just
// renders blank. PDF.js sidesteps the problem entirely: we parse the PDF
// ourselves and paint pages to a <canvas>, so behavior is identical on every
// device and no longer depends on what the browser happens to support.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

// Bound how large a page can be rendered so a huge desktop monitor doesn't
// force an enormous canvas (memory/CPU), and so a very narrow phone doesn't
// collapse a page to an unreadable sliver.
const MIN_SCALE = 0.35;
const MAX_SCALE = 3;

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

  // Load and parse the PDF whenever the note changes (or a retry is requested).
  // This is the only step that touches the network, so page navigation below
  // never re-downloads the file.
  useEffect(
    function () {
      let cancelled = false;
      let loadingTask = null;
      const controller = new AbortController();

      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);

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
          // Defensive check: make sure we actually got a PDF and not, say, an
          // HTML error page served with a 200 status by some proxy in the chain.
          const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
          if (header !== '%PDF-') {
            throw new Error('This file is not a valid PDF.');
          }

          loadingTask = pdfjsLib.getDocument({ data: bytes });
          return loadingTask.promise;
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
        if (loadingTask) {
          // Cancels in-flight parsing and releases the pdf.js worker/transport
          // for this document, whether or not it had already resolved.
          loadingTask.destroy();
        }
      };
    },
    [noteId, retryCount]
  );

  // Track the width available to draw into, so the page fits the viewport on
  // any screen size and re-fits on resize, sidebar toggle, or orientation change.
  useEffect(function () {
    const el = viewportRef.current;
    if (!el) {
      return undefined;
    }

    function measure(width) {
      setContainerWidth(function (prev) {
        return Math.abs(prev - width) > 1 ? width : prev;
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(function (entries) {
        for (const entry of entries) {
          measure(entry.contentRect.width);
        }
      });
      observer.observe(el);
      return function () {
        observer.disconnect();
      };
    }

    // Fallback for environments without ResizeObserver.
    measure(el.clientWidth);
    function onResize() {
      measure(el.clientWidth);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return function () {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Render the current page whenever the doc, page number, or available
  // width changes. Cancels any in-flight render before starting a new one so
  // rapid page turns or resize events never crash pdf.js.
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

          // Render at device pixel ratio so text stays crisp on high-DPI phone
          // screens instead of looking blurry when scaled up by CSS.
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
          setError('Failed to render this page.');
        });

      return function () {
        cancelled = true;
      };
    },
    [pdfDoc, currentPage, containerWidth]
  );

  // Release pdf.js resources on unmount.
  useEffect(function () {
    return function () {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, []);

  function handleRetry() {
    setRetryCount(function (count) {
      return count + 1;
    });
  }

  function goToPage(next) {
    setCurrentPage(function (page) {
      const clamped = Math.min(Math.max(next, 1), numPages || 1);
      return clamped;
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
