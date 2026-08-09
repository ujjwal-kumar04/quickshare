import { useState, useCallback } from 'react';
import { getErrorMessage } from '../services/api';

/**
 * Small wrapper for async calls: tracks loading/error state so pages don't
 * repeat the same try/catch/finally boilerplate.
 */
const useApi = (fn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { run, loading, error };
};

export default useApi;
