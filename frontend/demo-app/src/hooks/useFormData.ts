import { useState, useCallback } from 'react';

// Generic hook for managing form data with source-based updates
export function useFormData<T extends Record<string, any>>(initialData: T) {
  const [formData, setFormData] = useState<T>(initialData);

  const updateField = useCallback(<K extends keyof T>(
    source: K,
    value: T[K],
    transform?: (value: any) => T[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [source]: transform ? transform(value) : value
    }));
  }, []);

  const setForm = useCallback((updater: (prev: T) => T) => {
    setFormData(updater);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  return {
    formData,
    updateField,
    setForm,
    resetForm
  };
}