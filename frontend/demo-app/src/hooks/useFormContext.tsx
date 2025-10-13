import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface FormContextType<T extends Record<string, any>> {
  formData: T;
  updateField: <K extends keyof T>(
    source: K,
    value: T[K],
    transform?: (value: any) => T[K]
  ) => void;
  setForm: (updater: (prev: T) => T) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType<any> | null>(null);

interface FormProviderProps<T extends Record<string, any>> {
  children: ReactNode;
  initialData: T;
}

export function FormProvider<T extends Record<string, any>>({ 
  children, 
  initialData 
}: FormProviderProps<T>) {
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

  const formMethods = {
    formData,
    updateField,
    setForm,
    resetForm
  };

  return (
    <FormContext.Provider value={formMethods as FormContextType<any>}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<T extends Record<string, any>>(): FormContextType<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}