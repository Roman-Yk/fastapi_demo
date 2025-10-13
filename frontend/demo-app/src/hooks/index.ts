// Export all custom hooks for easy importing
export * from './useApi';
export * from './useFormData';
export * from './useReference';
export * from './usePerformance';
export * from './useFormContext';

// Re-export commonly used React hooks for convenience
export { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef, 
  useContext, 
  useReducer,
  useLayoutEffect 
} from 'react';