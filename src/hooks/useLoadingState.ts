import { useState, useEffect } from 'react';

interface UseLoadingStateOptions {
  /** Minimum time in ms to show loading state (default: 400) */
  minLoadTime?: number;
  /** Initial loading state (default: true) */
  initialLoading?: boolean;
}

interface UseLoadingStateReturn<T> {
  isLoading: boolean;
  data: T;
  startLoading: () => void;
  stopLoading: () => void;
}

/**
 * Hook that manages loading state with a minimum display time
 * for smoother skeleton transitions
 */
export function useLoadingState<T>(
  data: T,
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn<T> {
  const { minLoadTime = 400, initialLoading = true } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(
    initialLoading ? Date.now() : null
  );

  useEffect(() => {
    if (!initialLoading) return;

    const elapsed = Date.now() - (loadStartTime || Date.now());
    const remaining = Math.max(0, minLoadTime - elapsed);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, remaining);

    return () => clearTimeout(timer);
  }, [initialLoading, loadStartTime, minLoadTime]);

  const startLoading = () => {
    setLoadStartTime(Date.now());
    setIsLoading(true);
  };

  const stopLoading = () => {
    const elapsed = Date.now() - (loadStartTime || Date.now());
    const remaining = Math.max(0, minLoadTime - elapsed);

    setTimeout(() => {
      setIsLoading(false);
    }, remaining);
  };

  return {
    isLoading,
    data,
    startLoading,
    stopLoading,
  };
}

/**
 * Simple hook that just provides initial loading simulation
 */
export function useInitialLoading(minLoadTime: number = 400): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  return isLoading;
}
