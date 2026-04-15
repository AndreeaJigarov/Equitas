import { useState } from 'react';
import { type Horse, type HorseFormData, type Difficulty } from '../../../types/Horse';
import { validateHorse, isFormValid } from '../../../utils/Validation';
import { type PanelMode } from '../../../pages/HorsesPage/HorsesPage';
import styles from './HorseDetailView.module.css';

// This component handles the right-side panel of the Horses page, showing either:
// - an empty state when no horse is selected
// - a detailed view of the selected horse
// - a form for adding a new horse or editing an existing one
interface Props { //defines the expected props for the HorseDetailView component
  mode: PanelMode;
  horse?: Horse;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSubmitAdd: (data: HorseFormData) => void;
  onSubmitEdit: (data: HorseFormData) => void;
  onCancel: () => void;
}

// emptyForm is a template for initializing the form state when adding a new horse, ensuring all fields are defined with default values. This prevents issues with uncontrolled inputs and simplifies form handling logic.
const emptyForm: HorseFormData = {
  name: '', breed: '', difficulty: 'Easy', weight: 0,
  dateOfBirth: '', about: '', isAvailable: true,
  inTraining: false, recommendedFor: 'Both',
};

// HorseDetailView is the main component that renders the right panel of the Horses page. It conditionally renders different content based on the current mode (view, add, edit) and the presence of a selected horse. It also manages local state for showing delete confirmation and handles user interactions through the provided callback props.
export const HorseDetailView = ({
  mode, horse, onEdit, onDelete, onSubmitAdd, onSubmitEdit, onCancel,
}: Props) => {

  // ── EMPTY ─────────────────────────────────────────────
  //Purpose: Handles the "initial" view when no horse is selected.
  if (mode === 'none') {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🐴</div>
        <p className={styles.emptyText}>Select a horse to view details</p>
        <p className={styles.emptySub}>or use "add new +" to create one</p>
      </div>
    );
  }

  // ── ADD / EDIT FORM ────────────────────────────────────
  //Purpose: Switches the panel into "Edit" or "Add" mode.
  if (mode === 'add' || mode === 'edit') {
    return (
      <InlineForm
        key={mode === 'edit' ? horse?.id : 'new'}
        initial={mode === 'edit' ? horse : undefined}
        isEdit={mode === 'edit'}
        onSubmit={mode === 'add' ? onSubmitAdd : onSubmitEdit}
        onCancel={onCancel}
      />
    );
  }

  // ── VIEW ───────────────────────────────────────────────
  if (!horse) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  //Purpose: Displays the horse's identity and status.
  const statusBadge = () => {
    if (horse.inTraining)
      return <span className={`${styles.badge} ${styles.badgeTraining}`}>In Training</span>;
    if (horse.isAvailable)
      return <span className={`${styles.badge} ${styles.badgeAvail}`}>Available</span>;
    return <span className={`${styles.badge} ${styles.badgeUnavail}`}>Unavailable</span>;
  };

  const age = () => {
    const diff = Date.now() - new Date(horse.dateOfBirth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  };

  return (
    <div className={styles.viewPanel}>
      {/* Header */}
      <div className={styles.viewHeader}>
        <div className={styles.avatarLarge}>
          {horse.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.viewHeaderInfo}>
          <h2 className={styles.viewName}>{horse.name}</h2>
          <p className={styles.viewId}>ID: #{horse.id}</p>
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${diffBadge(horse.difficulty)}`}>
              {horse.difficulty}
            </span>
            {statusBadge()}
            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
              {horse.recommendedFor === 'Both' ? 'All riders' : horse.recommendedFor}
            </span>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className={styles.fields}>
        <Field label="Breed" value={horse.breed} />
        <Field label="Weight" value={`${horse.weight} kg`} />
        <Field label="Date of birth" value={
          new Date(horse.dateOfBirth).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        } />
        <Field label="Age" value={`${age()} years old`} />
        <div className={styles.fieldFull}>
          <span className={styles.fieldLabel}>About</span>
          <p className={styles.fieldAbout}>{horse.about}</p>
        </div>
      </div>


      {/* Footer actions */}
      <div className={styles.viewFooter}>
        {!showDeleteConfirm ? (
          <>
            <button className={styles.btnDelete} onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
            <button className={styles.btnEdit} onClick={onEdit}>
              Edit
            </button>
          </>
        ) : (
          <div className={styles.confirmRow}>
            <p className={styles.confirmText}>Remove <strong>{horse.name}</strong>?</p>
            <button className={styles.btnCancelSm} onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
            <button className={styles.btnConfirmDelete} onClick={() => onDelete(horse.id)}>
              Yes, remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── small helper ─────────────────────────────────────────
const Field = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={styles.fieldValue}>{value}</span>
  </div>
);

function diffBadge(d: Difficulty) {
  if (d === 'Easy') return styles.badgeEasy;
  if (d === 'Medium') return styles.badgeMedium;
  return styles.badgeHard;
}

// ── Inline form (add or edit) ────────────────────────────
interface FormProps {
  initial?: Horse;
  isEdit: boolean;
  onSubmit: (data: HorseFormData) => void;
  onCancel: () => void;
}



const InlineForm = ({ initial, isEdit, onSubmit, onCancel }: FormProps) => {
  const [form, setForm] = useState<HorseFormData>(
    initial ? {
      name: initial.name, breed: initial.breed, difficulty: initial.difficulty,
      weight: initial.weight, dateOfBirth: initial.dateOfBirth, about: initial.about,
      isAvailable: initial.isAvailable, inTraining: initial.inTraining,
      recommendedFor: initial.recommendedFor,
    } : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validateHorse(form));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.keys(emptyForm).reduce((a, k) => ({ ...a, [k]: true }), {}));
    const errs = validateHorse(form);
    setErrors(errs);
    if (isFormValid(errs)) onSubmit(form);
  };

  const fc = (name: string) =>
    `${styles.input} ${touched[name] && errors[name] ? styles.inputError : ''}`;

  return (
    <form className={styles.formPanel} onSubmit={handleSubmit} noValidate>

      {/* HEADER — mirrors viewHeader */}
      <div className={styles.viewHeader}>
        <div className={styles.formAvatarPlaceholder}>
          {isEdit && initial
            ? <span className={styles.formAvatarLetter}>{initial.name.charAt(0).toUpperCase()}</span>
            : <span className={styles.formAvatarIcon}>+</span>
          }
        </div>
        <div className={styles.viewHeaderInfo}>
          {/* Name field — replaces the big horse name */}
          <input
            id="name"
            name="name"
            className={`${styles.nameInput} ${touched.name && errors.name ? styles.inputError : ''}`}
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="Horse name..."
          />
          {touched.name && errors.name && <span className={styles.errMsg}>{errors.name}</span>}

          {/* ID line */}
          <p className={styles.viewId}>
            {isEdit ? `ID: #${initial?.id}` : 'ID: auto-generated'}
          </p>

          {/* Difficulty + Recommended for as selects — replaces badges */}
          <div className={styles.badgeRow}>
            <select name="difficulty" className={styles.selectBadge} value={form.difficulty} onChange={handleChange}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select name="recommendedFor" className={styles.selectBadge} value={form.recommendedFor} onChange={handleChange}>
              <option value="Children">Children</option>
              <option value="Adults">Adults</option>
              <option value="Both">Both</option>
            </select>
            <label className={styles.checkItemInline}>
              <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
              Available
            </label>
            <label className={styles.checkItemInline}>
              <input type="checkbox" name="inTraining" checked={form.inTraining} onChange={handleChange} />
              In training
            </label>
          </div>
        </div>
      </div>

      {/* FIELDS — mirrors .fields grid */}
      <div className={styles.fields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Breed *</span>
          <input name="breed" className={fc('breed')} value={form.breed}
            onChange={handleChange} onBlur={() => handleBlur('breed')} placeholder="e.g. Andalusian" />
          {touched.breed && errors.breed && <span className={styles.errMsg}>{errors.breed}</span>}
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Weight (kg) *</span>
          <input name="weight" type="number" className={fc('weight')}
            value={form.weight || ''} onChange={handleChange} onBlur={() => handleBlur('weight')}
            placeholder="200–900" min={200} max={900} />
          {touched.weight && errors.weight && <span className={styles.errMsg}>{errors.weight}</span>}
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Date of birth *</span>
          <input name="dateOfBirth" type="date" className={fc('dateOfBirth')}
            value={form.dateOfBirth} onChange={handleChange} onBlur={() => handleBlur('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]} />
          {touched.dateOfBirth && errors.dateOfBirth && <span className={styles.errMsg}>{errors.dateOfBirth}</span>}
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Age</span>
          <input className={styles.input} disabled placeholder="Calculated from date of birth"
            style={{ opacity: 0.45, cursor: 'not-allowed' }} />
        </div>

        <div className={styles.fieldFull}>
          <span className={styles.fieldLabel}>About *</span>
          <textarea name="about"
            className={`${styles.aboutTextarea} ${touched.about && errors.about ? styles.inputError : ''}`}
            value={form.about} onChange={handleChange} onBlur={() => handleBlur('about')}
            placeholder="Temperament and abilities of the horse..." />
          {touched.about && errors.about && <span className={styles.errMsg}>{errors.about}</span>}
        </div>
      </div>

      {/* FOOTER — same as viewFooter */}
      <div className={styles.viewFooter}>
        <button type="button" className={styles.btnDelete} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.btnEdit}>
          {isEdit ? 'Save changes' : 'Add horse'}
        </button>
      </div>

    </form>
  );
};