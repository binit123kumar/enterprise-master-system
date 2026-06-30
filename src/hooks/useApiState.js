import { useState, useCallback } from "react";

export function useApiState(apiFn, initialData = null) {
  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result?.data ?? result);
      return result;
    } catch (err) {
      setError(err.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const reset = () => { setData(initialData); setError(null); };

  return { data, loading, error, execute, reset };
}
