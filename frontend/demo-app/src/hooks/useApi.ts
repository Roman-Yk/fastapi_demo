import { useState, useEffect, useCallback, useRef } from 'react';
import { BaseApiError } from '../services/baseApiService';

export interface UseApiOptions<T = unknown> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: BaseApiError) => void;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: BaseApiError | null;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Enhanced hook for API calls with proper error handling and loading states
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseApiOptions<T> = {}
): UseApiState<T> & {
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = true, onSuccess, onError } = options;
  const isMountedRef = useRef(true);
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isError: false,
    }));

    try {
      const result = await apiCall();
      
      if (!isMountedRef.current) return;
      
      setState({
        data: result,
        loading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      onSuccess?.(result);
    } catch (error) {
      if (!isMountedRef.current) return;
      
      const apiError = error instanceof BaseApiError 
        ? error 
        : new BaseApiError('An unexpected error occurred', 0, error);
      
      setState({
        data: null,
        loading: false,
        error: apiError,
        isSuccess: false,
        isError: true,
      });

      onError?.(apiError);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    refetch: execute,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation<T, Args extends unknown[]>(
  mutationFn: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
): {
  mutate: (...args: Args) => Promise<T>;
  state: UseApiState<T>;
  reset: () => void;
} {
  const { onSuccess, onError } = options;
  const isMountedRef = useRef(true);
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const mutate = useCallback(async (...args: Args): Promise<T> => {
    if (!isMountedRef.current) {
      throw new Error('Component unmounted');
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isError: false,
    }));

    try {
      const result = await mutationFn(...args);
      
      if (!isMountedRef.current) {
        throw new Error('Component unmounted');
      }
      
      setState({
        data: result,
        loading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      const apiError = error instanceof BaseApiError 
        ? error 
        : new BaseApiError('An unexpected error occurred', 0, error);
      
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: apiError,
          isSuccess: false,
          isError: true,
        });
      }

      onError?.(apiError);
      throw apiError;
    }
  }, [mutationFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    mutate,
    state,
    reset,
  };
}