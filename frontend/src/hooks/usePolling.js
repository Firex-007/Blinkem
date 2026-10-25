import { useEffect, useState, useRef } from 'react';

export function usePolling(fn, ms = 2000, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const run = async (isManual = false) => {
    if (!enabled) return;
    if (isManual || data === null) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fnRef.current();
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    // Initial load: show loading skeleton until first response
    const initialRun = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fnRef.current();
        if (isMounted) setData(res);
      } catch (e) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialRun();

    // Background interval: silently update data, NEVER toggle loading
    const id = setInterval(async () => {
      if (!isMounted) return;
      try {
        const res = await fnRef.current();
        if (isMounted) setData(res);
      } catch {
        // Keep existing data on background error
      }
    }, ms);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [enabled, ms]);

  return { data, error, loading, refetch: () => run(true) };
}

export default usePolling;
