import { createContext, useContext, ReactNode } from 'react';
import { useFormData, FormValidationRule } from './useFormData';

// TypeScript-friendly form context interface
interface FormContextType<T extends Record<string, any>> {
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  updateField: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: { validate?: boolean; touch?: boolean }
  ) => void;
  handleBlur: <K extends keyof T>(field: K) => void;
  setForm: (updater: (prev: T) => T) => void;
  resetForm: () => void;
  validateField: <K extends keyof T>(field: K, value: T[K]) => string | undefined;
  validateAll: () => boolean;
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    error?: string;
    onChange: (value: T[K]) => void;
    onBlur: () => void;
  };
}

const FormContext = createContext<FormContextType<any> | null>(null);

// TypeScript-friendly FormProvider props
interface FormProviderProps<T extends Record<string, any>> {
  children: ReactNode;
  initialData: T;
  validationRules?: Record<string, FormValidationRule<any>[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// TypeScript-friendly FormProvider using useFormData hook
export function FormProvider<T extends Record<string, any>>({ 
  children, 
  initialData,
  validationRules,
  validateOnChange = false,
  validateOnBlur = true
}: FormProviderProps<T>) {
  const formMethods = useFormData<T>({
    initialData,
    validationRules,
    validateOnChange,
    validateOnBlur
  });

  return (
    <FormContext.Provider value={formMethods as FormContextType<any>}>
      {children}
    </FormContext.Provider>
  );
}

// TypeScript-friendly useFormContext hook
export function useFormContext<T extends Record<string, any>>(): FormContextType<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}