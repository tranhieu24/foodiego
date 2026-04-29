import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook để fetch dữ liệu từ API hoặc mock function
 * @param {string|Function} source - URL hoặc async function trả về data
 * @param {any[]} deps - Dependencies array để refetch
 */
const useFetch = (source, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      let result;

      if (typeof source === 'function') {
        // If source is a function (mock data), call it
        result = await source();
      } else if (typeof source === 'string') {
        // If source is a URL, fetch it
        const response = await fetch(source, {
          signal: abortControllerRef.current.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        result = await response.json();
      }

      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, ...deps]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useFetch;
