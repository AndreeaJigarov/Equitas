import { useState } from 'react';
import {type Horse, type HorseFormData } from '../../../types/Horse';
import { validateHorse, isFormValid } from '../../../utils/Validation';
import styles from './HorseForm.module.css';

interface HorseFormProps {
  initial?: Horse;
  onSubmit: (data: HorseFormData) => void;
  onCancel: () => void;
}

const defaultForm: HorseFormData = {
  name: '',
  breed: '',
  difficulty: 'Easy',
  weight: 0,
  dateOfBirth: '',
  about: '',
  isAvailable: true,
  inTraining: false,
  recommendedFor: 'Both',
};

export const HorseForm = ({ initial, onSubmit, onCancel }: HorseFormProps) => {
  const [form, setForm] = useState<HorseFormData>(
    initial
      ? {
          name: initial.name,
          breed: initial.breed,
          difficulty: initial.difficulty,
          weight: initial.weight,
          dateOfBirth: initial.dateOfBirth,
          about: initial.about,
          isAvailable: initial.isAvailable,
          inTraining: initial.inTraining,
          recommendedFor: initial.recommendedFor
        }
      : defaultForm
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));

    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateHorse(form);
    setErrors(errs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(defaultForm).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);

    const errs = validateHorse(form);
    setErrors(errs);

    if (isFormValid(errs)) {
      onSubmit(form);
    }
  };

  const fieldClass = (name: string) =>
    `${styles.input} ${touched[name] && errors[name] ? styles.error : ''}`;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>
        {initial ? 'Edit Horse' : 'Add New Horse'}
      </h2>

      <div className={styles.grid}>
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            className={fieldClass('name')}
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="e.g. Bella"
          />
          {touched.name && errors.name && (
            <span className={styles.errorMsg}>{errors.name}</span>
          )}
        </div>

        {/* Breed */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="breed">Breed *</label>
          <input
            id="breed"
            name="breed"
            className={fieldClass('breed')}
            value={form.breed}
            onChange={handleChange}
            onBlur={() => handleBlur('breed')}
            placeholder="e.g. Andalusian"
          />
          {touched.breed && errors.breed && (
            <span className={styles.errorMsg}>{errors.breed}</span>
          )}
        </div>

        {/* Difficulty */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="difficulty">Difficulty *</label>
          <select
            id="difficulty"
            name="difficulty"
            className={`${styles.select} ${touched.difficulty && errors.difficulty ? styles.error : ''}`}
            value={form.difficulty}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Recommended for */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="recommendedFor">Recommended for *</label>
          <select
            id="recommendedFor"
            name="recommendedFor"
            className={styles.select}
            value={form.recommendedFor}
            onChange={handleChange}
          >
            <option value="Children">Children</option>
            <option value="Adults">Adults</option>
            <option value="Both">Both</option>
          </select>
        </div>

        {/* Weight */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="weight">Weight (kg) *</label>
          <input
            id="weight"
            name="weight"
            type="number"
            className={fieldClass('weight')}
            value={form.weight || ''}
            onChange={handleChange}
            onBlur={() => handleBlur('weight')}
            placeholder="200 – 900"
            min={200}
            max={900}
          />
          {touched.weight && errors.weight && (
            <span className={styles.errorMsg}>{errors.weight}</span>
          )}
        </div>

        {/* Date of birth */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="dateOfBirth">Date of birth *</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            className={fieldClass('dateOfBirth')}
            value={form.dateOfBirth}
            onChange={handleChange}
            onBlur={() => handleBlur('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]}
          />
          {touched.dateOfBirth && errors.dateOfBirth && (
            <span className={styles.errorMsg}>{errors.dateOfBirth}</span>
          )}
        </div>

        {/* About */}
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="about">Description *</label>
          <textarea
            id="about"
            name="about"
            className={`${styles.textarea} ${touched.about && errors.about ? styles.error : ''}`}
            value={form.about}
            onChange={handleChange}
            onBlur={() => handleBlur('about')}
            placeholder="Brief description of the horse's temperament and abilities..."
          />
          {touched.about && errors.about && (
            <span className={styles.errorMsg}>{errors.about}</span>
          )}
        </div>

        {/* Status toggles */}
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Status</span>
          <div className={styles.toggleRow}>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                name="isAvailable"
                checked={form.isAvailable}
                onChange={handleChange}
              />
              Available for booking
            </label>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                name="inTraining"
                checked={form.inTraining}
                onChange={handleChange}
              />
              Currently in training
            </label>
          </div>
        </div>
        </div>


      <div className={styles.formFooter}>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.btnSubmit}>
          {initial ? 'Save changes' : 'Add horse'}
        </button>
      </div>
    </form>

  );
};