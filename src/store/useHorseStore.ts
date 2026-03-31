import { create } from 'zustand';
import { type Horse, type HorseFormData } from '../types/Horse';

const initialHorses: Horse[] = [
  {
    id: '1',
    name: 'Bella',
    breed: 'Andalusian',
    difficulty: 'Medium',
    weight: 480,
    dateOfBirth: '2017-04-12',
    about: 'Calm and responsive mare, great for intermediate riders. Excellent in lateral work and canter transitions.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Both',
  },
  {
    id: '2',
    name: 'Daisy',
    breed: 'Quarter Horse',
    difficulty: 'Easy',
    weight: 520,
    dateOfBirth: '2014-06-01',
    about: 'Very gentle and patient mare, ideal for beginners and children. Consistent temperament and low daily load.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Both',
  },
  {
    id: '3',
    name: 'Storm',
    breed: 'Thoroughbred',
    difficulty: 'Hard',
    weight: 550,
    dateOfBirth: '2019-09-20',
    about: 'High energy stallion with excellent form. Experienced riders only. Currently in a training program.',
    isAvailable: false,
    inTraining: true,
    recommendedFor: 'Adults',
  },
  {
    id: '4',
    name: 'Luna',
    breed: 'Lusitano',
    difficulty: 'Medium',
    weight: 490,
    dateOfBirth: '2015-03-18',
    about: 'Elegant and steady mare. Performs well in dressage and leisure rides alike.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Adults',
  },
  {
    id: '5',
    name: 'Rex',
    breed: 'Hanoverian',
    difficulty: 'Hard',
    weight: 600,
    dateOfBirth: '2018-11-05',
    about: 'Competition-grade gelding. Requires an advanced rider with jumping experience.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Adults',
  },
  {
    id: '6',
    name: 'Milo',
    breed: 'Shetland Pony',
    difficulty: 'Easy',
    weight: 300,
    dateOfBirth: '2016-07-22',
    about: 'Friendly and small pony, perfect for young children. Very calm under pressure.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Children',
  },
];

let nextId = initialHorses.length + 1;

interface HorseStore {
  horses: Horse[];
  addHorse: (data: HorseFormData) => void;
  updateHorse: (id: string, data: HorseFormData) => void;
  removeHorse: (id: string) => void;
  getHorseById: (id: string) => Horse | undefined;
}

export const useHorseStore = create<HorseStore>((set, get) => ({
  horses: initialHorses,

  addHorse: (data) =>
    set((state) => ({
      horses: [...state.horses, { ...data, id: String(nextId++) }],
    })),

  updateHorse: (id, data) =>
    set((state) => ({
      horses: state.horses.map((h) =>
        h.id === id ? { ...data, id } : h
      ),
    })),

  removeHorse: (id) =>
    set((state) => ({
      horses: state.horses.filter((h) => h.id !== id),
    })),

  getHorseById: (id) => get().horses.find((h) => h.id === id),
}));