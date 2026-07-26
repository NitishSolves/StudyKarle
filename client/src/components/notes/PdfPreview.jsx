import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import Spinner from '../common/Spinner';
import ErrorState from '../common/ErrorState';

export default function PdfPreview({ noteId, title }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let objectUrl = null;
      let cancelled = false;

      setLoading(true);
      setError(null);
      setBlobUrl(null);

      axiosClient
        .get('/notes/' + noteId + '/preview', { responseType: 'blob' })
        .then(function (res) {
          if (cancelled) {
            return;
          }
          objectUrl = URL.createObjectURL(res.data);
          setBlobUrl(objectUrl);
        })
        .catch(function (err) {
          if (!cancelled) {
            setError(err.message || 'Failed to load preview');
          }
        })
        .finally(function () {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return function () {
        cancelled = true;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    },
    [noteId]
  );

  return (
    <div className="relative bg-surface-high rounded-xl overflow-hidden border border-border-subtle h-[70vh] lg:h-[750px]">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Spinner size="lg" label="Loading preview..." />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <ErrorState message={error} />
        </div>
      ) : (
        <iframe src={blobUrl} title={title || 'Note preview'} className="w-full h-full border-0" />
      )}
    </div>
  );
}
