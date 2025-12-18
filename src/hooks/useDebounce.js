import { useCallback } from 'react';

const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useCallback((timeout) => {
    return timeout;
  }, []);

  return useCallback((...args) => {
    const timeout = timeoutRef(null);
    if (timeout) clearTimeout(timeout);

    const newTimeout = setTimeout(() => {
      callback(...args);
    }, delay);

    return newTimeout;
  }, [callback, delay, timeoutRef]);
};

export default useDebounce;
