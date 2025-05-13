import { AbstractControl, ValidatorFn } from '@angular/forms';
import postalCodes from 'postal-codes-js';

export function getRandomId(): string {
  return Date.now().toString() + Math.random().toFixed(5);
}

export function minAgeValidator(minAge: number): ValidatorFn {
  function howOldAreYou(currentValue: number, value: string): boolean {
    const date = new Date(value);
    const years = currentValue * 365 * 24 * 60 * 60 * 1000;
    const different = Date.now() - date.getTime();
    return different > years;
  }
  return (control: AbstractControl) => {
    return howOldAreYou(minAge, control.value) ? null : { minAge: { requiredAge: 13 } };
  };
}

export function postalCodeValidator(keyCountry: string): ValidatorFn {
  function checkCode(keyCountry: string, code: string): boolean | string {
    return postalCodes.validate(keyCountry, code);
  }
  return (control: AbstractControl) => {
    const countryControl = control.parent?.get(keyCountry);
    const country = countryControl?.value;
    const postalCode = control.value;
    if (!country) return null;
    return typeof checkCode(countryControl?.value, postalCode) === 'boolean' && checkCode(country, postalCode)
      ? null
      : { postCodeValid: { incalidCode: true } };
  };
}
