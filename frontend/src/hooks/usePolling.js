import { useEffect, useState } from 'react';

export function usePolling(fn, ms = 2000, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);

  const run = async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
    const id = setInterval(run, ms);
    return () => clearInterval(id);
  }, [enabled, ms]);

  return { data, error, loading, refetch: run };
}
