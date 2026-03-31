import { type HorseFormData } from '../types/Horse';

export type ValidationErrors = Record<string, string>;

export function validateHorse(data: HorseFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim())
    errors.name = 'Name is required.';
  else if (data.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.';
  else if (data.name.trim().length > 50)
    errors.name = 'Name must be under 50 characters.';

  if (!data.breed.trim())
    errors.breed = 'Breed is required.';
  else if (data.breed.trim().length < 2)
    errors.breed = 'Breed must be at least 2 characters.';

  if (!data.weight || isNaN(data.weight))
    errors.weight = 'Weight is required.';
  else if (data.weight < 200 || data.weight > 900)
    errors.weight = 'Weight must be between 200 and 900 kg.';

  if (!data.dateOfBirth)
    errors.dateOfBirth = 'Date of birth is required.';
  else {
    const dob = new Date(data.dateOfBirth);
    const now = new Date();
    if (isNaN(dob.getTime()))
      errors.dateOfBirth = 'Invalid date.';
    else if (dob >= now)
      errors.dateOfBirth = 'Date of birth must be in the past.';
  }

  if (!data.about.trim())
    errors.about = 'Description is required.';
  else if (data.about.trim().length < 10)
    errors.about = 'Description must be at least 10 characters.';

  if (!data.difficulty)
    errors.difficulty = 'Difficulty is required.';

  if (!data.recommendedFor)
    errors.recommendedFor = 'Recommended for is required.';

  return errors;
}

export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}