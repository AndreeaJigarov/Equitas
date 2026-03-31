export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RecommendedFor = 'Children' | 'Adults' | 'Both';

export interface Horse {
  id: string;
  name: string;
  breed: string;
  difficulty: Difficulty;
  weight: number;
  dateOfBirth: string;
  about: string;
  inTraining: boolean;
  recommendedFor: RecommendedFor;
  isAvailable: boolean;
}

export type HorseFormData = Omit<Horse, 'id'>;