import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator: date must be today or in the future (not in the past).
 * Error key: `notInPast`
 */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(control.value);
    date.setHours(0, 0, 0, 0);

    return date < today ? { notInPast: true } : null;
  };
}

/**
 * Validator: date must be today or in the past (not in the future).
 * Error key: `notInFuture`
 */
export function notInFutureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(control.value);
    date.setHours(0, 0, 0, 0);

    return date > today ? { notInFuture: true } : null;
  };
}
