import { useCallback, useEffect, useState } from 'react';

export default function useFetch(fetcher, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(function () {
    setLoading(true);
    setError(null);
    return fetcher()
      .then(function (result) {
        setData(result);
      })
      .catch(function (err) {
        setError(err.message || 'Failed to load data');
      })
      .finally(function () {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || []);

  useEffect(
    function () {
      load();
    },
    [load]
  );

  return { data: data, error: error, loading: loading, reload: load, setData: setData };
}
