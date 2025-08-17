import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  validationRules?: ValidationRule[];
}

export function useFormValidation<T>(
  form: UseFormReturn<T>,
  steps: FormStep[]
) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = useCallback(
    (stepIndex: number): boolean => {
      const step = steps[stepIndex - 1];
      if (!step) return false;

      const stepErrors: Record<string, string> = {};
      const formValues = form.getValues();

      // Check required fields for current step
      step.fields.forEach((fieldName) => {
        const value = (formValues as any)[fieldName];
        const isEmpty = value === undefined || value === null || value === "" || 
                       (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          stepErrors[fieldName] = `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
        }
      });

      // Apply custom validation rules
      if (step.validationRules) {
        step.validationRules.forEach((rule) => {
          const value = (formValues as any)[rule.field];
          
          if (rule.required && !value) {
            stepErrors[rule.field] = rule.message || `${rule.field} is required`;
          }
          
          if (value && rule.minLength && value.length < rule.minLength) {
            stepErrors[rule.field] = rule.message || `${rule.field} must be at least ${rule.minLength} characters`;
          }
          
          if (value && rule.maxLength && value.length > rule.maxLength) {
            stepErrors[rule.field] = rule.message || `${rule.field} must be less than ${rule.maxLength} characters`;
          }
          
          if (value && rule.pattern && !rule.pattern.test(value)) {
            stepErrors[rule.field] = rule.message || `${rule.field} format is invalid`;
          }
        });
      }

      setErrors(stepErrors);

      // Set form errors for visual feedback
      Object.keys(stepErrors).forEach((field) => {
        form.setError(field as any, {
          type: "manual",
          message: stepErrors[field]
        });
      });

      return Object.keys(stepErrors).length === 0;
    },
    [form, steps]
  );

  const goToNextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      // Clear errors when moving to next step
      setErrors({});
      form.clearErrors();
      return true;
    }
    return false;
  }, [currentStep, steps.length, validateStep, form]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear errors when going back
      setErrors({});
      form.clearErrors();
      return true;
    }
    return false;
  }, [currentStep, form]);

  const validateAllSteps = useCallback((): boolean => {
    let allValid = true;
    const allErrors: Record<string, string> = {};

    steps.forEach((_, index) => {
      const stepValid = validateStep(index + 1);
      if (!stepValid) {
        allValid = false;
        Object.assign(allErrors, errors);
      }
    });

    setErrors(allErrors);
    return allValid;
  }, [steps, validateStep, errors]);

  const getCurrentStep = useCallback(() => {
    return steps[currentStep - 1];
  }, [steps, currentStep]);

  const getStepFields = useCallback((stepIndex: number) => {
    const step = steps[stepIndex - 1];
    return step ? step.fields : [];
  }, [steps]);

  const isStepValid = useCallback((stepIndex: number) => {
    return validateStep(stepIndex);
  }, [validateStep]);

  return {
    currentStep,
    setCurrentStep,
    totalSteps: steps.length,
    errors,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    validateAllSteps,
    getCurrentStep,
    getStepFields,
    isStepValid,
    clearErrors: () => {
      setErrors({});
      form.clearErrors();
    }
  };
}