import { AbstractControl, ValidatorFn } from '@angular/forms';
import postalCodes from 'postal-codes-js';

const COUNT_NUMBER = 5;
const MILLISECONDS_IN_A_YEAR = 31536000000;
export function getRandomId(): string {
  return Date.now().toString() + Math.random().toFixed(COUNT_NUMBER);
}

export function minAgeValidator(minAge: number): ValidatorFn {
  function howOldAreYou(currentValue: number, value: string): boolean {
    const date = new Date(value);
    const years = currentValue * MILLISECONDS_IN_A_YEAR;
    const difference = Date.now() - date.getTime();
    return difference > years;
  }
  return (control: AbstractControl) => {
    return howOldAreYou(minAge, control.value) ? null : { minAge: { requiredAge: 13 } };
  };
}

export function postalCodeValidator(keyCountry: string): ValidatorFn {
  return (control: AbstractControl) => {
    const country = control.parent?.get(keyCountry)?.value;
    const postalCode = control.value;
    if (!country) return null;
    return typeof postalCodes.validate(country, postalCode) === 'boolean' && postalCodes.validate(country, postalCode)
      ? null
      : { postCodeValid: { incalidCode: true } };
  };
}
