import { AbstractControl, ValidatorFn } from '@angular/forms';
import postalCodes from 'postal-codes-js';

const COUNT_NUMBER = 5;
const COUNT_DAYS_IN_YEAR = 365;
const COUNT_HOURS_IN_DAYS = 24;
const COUNT_MINUTES_IN_HOURS = 60;
const COUNT_SECONDS_IN_MINUTES = 60;
const COUNT_MS_IN_SECOND = 1000;
export function getRandomId(): string {
  return Date.now().toString() + Math.random().toFixed(COUNT_NUMBER);
}

export function minAgeValidator(minAge: number): ValidatorFn {
  function howOldAreYou(currentValue: number, value: string): boolean {
    const date = new Date(value);
    const years =
      currentValue *
      COUNT_DAYS_IN_YEAR *
      COUNT_HOURS_IN_DAYS *
      COUNT_MINUTES_IN_HOURS *
      COUNT_SECONDS_IN_MINUTES *
      COUNT_MS_IN_SECOND;
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
