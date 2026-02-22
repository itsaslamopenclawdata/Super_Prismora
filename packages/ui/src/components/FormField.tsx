import React from 'react';
import { cn } from '../utils/cn';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth = false,
  children,
}) => {
  const childId = React.useId();
  const hasError = !!error;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={childId}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div aria-invalid={hasError}>
        {React.cloneElement(children as React.ReactElement, {
          id: childId,
          'aria-describedby': hasError
            ? `${childId}-error`
            : helperText
            ? `${childId}-helper`
            : undefined,
        })}
      </div>
      {hasError && (
        <p id={`${childId}-error`} className="mt-1 text-sm text-error-500">
          {error}
        </p>
      )}
      {helperText && !hasError && (
        <p id={`${childId}-helper`} className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
