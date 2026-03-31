import { useState } from 'react';
import { type Horse, type HorseFormData, type Difficulty } from '../../types/Horse';
import { validateHorse, isFormValid } from '../../utils/Validation';
import { type PanelMode } from '../../pages/HorsesPage/HorsesPage';
import styles from './HorseDetailView.module.css';

interface Props {
  mode: PanelMode;
  horse?: Horse;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSubmitAdd: (data: HorseFormData) => void;
  onSubmitEdit: (data: HorseFormData) => void;
  onCancel: () => void;
}

const emptyForm: HorseFormData = {
  name: '', breed: '', difficulty: 'Easy', weight: 0,
  dateOfBirth: '', about: '', isAvailable: true,
  inTraining: false, recommendedFor: 'Both',
};

export const HorseDetailView = ({
  mode, horse, onEdit, onDelete, onSubmitAdd, onSubmitEdit, onCancel,
}: Props) => {

  // ── EMPTY ─────────────────────────────────────────────
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

// const InlineForm = ({ initial, isEdit, onSubmit, onCancel }: FormProps) => {

//   const [form, setForm] = useState<HorseFormData>(
//     initial ? {
//       name: initial.name, breed: initial.breed, difficulty: initial.difficulty,
//       weight: initial.weight, dateOfBirth: initial.dateOfBirth, about: initial.about,
//       isAvailable: initial.isAvailable, inTraining: initial.inTraining,
//       recommendedFor: initial.recommendedFor,
//     } : emptyForm
//   );
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [touched, setTouched] = useState<Record<string, boolean>>({});

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;
//     setForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
//     }));
//     setTouched(prev => ({ ...prev, [name]: true }));
//   };

//   const handleBlur = (name: string) => {
//     setTouched(prev => ({ ...prev, [name]: true }));
//     setErrors(validateHorse(form));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setTouched(Object.keys(emptyForm).reduce((a, k) => ({ ...a, [k]: true }), {}));
//     const errs = validateHorse(form);
//     setErrors(errs);
//     if (isFormValid(errs)) onSubmit(form);
//   };

//   const fc = (name: string) =>
//     `${styles.input} ${touched[name] && errors[name] ? styles.inputError : ''}`;

//   return (
//     <form className={styles.formPanel} onSubmit={handleSubmit} noValidate>
//       <h2 className={styles.formTitle}>{isEdit ? 'Edit Horse' : 'Add New Horse'}</h2>

//       <div className={styles.formGrid}>
//         <div className={styles.formField}>
//           <label className={styles.fieldLabel} htmlFor="name">Name *</label>
//           <input id="name" name="name" className={fc('name')} value={form.name}
//             onChange={handleChange} onBlur={() => handleBlur('name')} placeholder="e.g. Bella" />
//           {touched.name && errors.name && <span className={styles.errMsg}>{errors.name}</span>}
//         </div>

//         <div className={styles.formField}>
//           <label className={styles.fieldLabel} htmlFor="breed">Breed *</label>
//           <input id="breed" name="breed" className={fc('breed')} value={form.breed}
//             onChange={handleChange} onBlur={() => handleBlur('breed')} placeholder="e.g. Andalusian" />
//           {touched.breed && errors.breed && <span className={styles.errMsg}>{errors.breed}</span>}
//         </div>

//         <div className={styles.formField}>
//           <label className={styles.fieldLabel} htmlFor="difficulty">Difficulty *</label>
//           <select id="difficulty" name="difficulty" className={styles.select}
//             value={form.difficulty} onChange={handleChange}>
//             <option value="Easy">Easy</option>
//             <option value="Medium">Medium</option>
//             <option value="Hard">Hard</option>
//           </select>
//         </div>

//         <div className={styles.formField}>
//           <label className={styles.fieldLabel} htmlFor="recommendedFor">Recommended for *</label>
//           <select id="recommendedFor" name="recommendedFor" className={styles.select}
//             value={form.recommendedFor} onChange={handleChange}>
//             <option value="Children">Children</option>
//             <option value="Adults">Adults</option>
//             <option value="Both">Both</option>
//           </select>
//         </div>

//         <div className={styles.formField}>
//           <label className={styles.fieldLabel} htmlFor="weight">Weight (kg) *</label>
//           <input id="weight" name="weight" type="number" className={fc('weight')}
//             value={form.weight || ''} onChange={handleChange} onBlur={() => handleBlur('weight')}
//             placeholder="200–900" min={200} max={900} />
//           {touched.weight && errors.weight && <span className={styles.errMsg}>{errors.weight}</span>}
//         </div>

//         <div className={styles.formField}>
//           <label className={styles.fieldLabel} htmlFor="dateOfBirth">Date of birth *</label>
//           <input id="dateOfBirth" name="dateOfBirth" type="date" className={fc('dateOfBirth')}
//             value={form.dateOfBirth} onChange={handleChange} onBlur={() => handleBlur('dateOfBirth')}
//             max={new Date().toISOString().split('T')[0]} />
//           {touched.dateOfBirth && errors.dateOfBirth && <span className={styles.errMsg}>{errors.dateOfBirth}</span>}
//         </div>

//         <div className={`${styles.formField} ${styles.formFieldFull}`}>
//           <label className={styles.fieldLabel} htmlFor="about">Description *</label>
//           <textarea id="about" name="about"
//             className={`${styles.textarea} ${touched.about && errors.about ? styles.inputError : ''}`}
//             value={form.about} onChange={handleChange} onBlur={() => handleBlur('about')}
//             placeholder="Temperament and abilities..." />
//           {touched.about && errors.about && <span className={styles.errMsg}>{errors.about}</span>}
//         </div>

//         <div className={`${styles.formField} ${styles.formFieldFull}`}>
//           <span className={styles.fieldLabel}>Status</span>
//           <div className={styles.checkRow}>
//             <label className={styles.checkItem}>
//               <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
//               Available for booking
//             </label>
//             <label className={styles.checkItem}>
//               <input type="checkbox" name="inTraining" checked={form.inTraining} onChange={handleChange} />
//               In training
//             </label>
//           </div>
//         </div>
//       </div>

//       <div className={styles.formFooter}>
//         <button type="button" className={styles.btnCancel} onClick={onCancel}>Cancel</button>
//         <button type="submit" className={styles.btnSubmit}>
//           {isEdit ? 'Save changes' : 'Add horse'}
//         </button>
//       </div>
//     </form>
//   );
// };




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