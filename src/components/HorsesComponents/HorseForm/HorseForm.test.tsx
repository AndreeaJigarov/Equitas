import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HorseForm } from './HorseForm';
import { type Horse } from '../../../types/Horse';

const mockHorse: Horse = {
    id: '1',
    name: 'Bella',
    breed: 'Andalusian',
    difficulty: 'Medium',
    weight: 480,
    dateOfBirth: '2017-04-12',
    about: 'Calm and responsive mare, great for intermediate riders.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Both',
};

const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Rocky' } });
    fireEvent.change(screen.getByLabelText(/Breed/i), { target: { value: 'Andalusian' } });
    fireEvent.change(screen.getByLabelText(/Weight/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/Date of birth/i), { target: { value: '2018-03-10' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A wonderful and calm horse.' } });
};

describe('HorseForm – Add mode', () => {
    it('renders "Add New Horse" title in add mode', () => {
        render(<HorseForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText(/Add New Horse/i)).toBeDefined();
    });

    it('renders empty fields in add mode', () => {
        render(<HorseForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
        expect((screen.getByLabelText(/Name/i) as HTMLInputElement).value).toBe('');
        expect((screen.getByLabelText(/Breed/i) as HTMLInputElement).value).toBe('');
    });

    it('shows validation errors when submitted with all empty fields', async () => {
        render(<HorseForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: /Add horse/i }));

        await waitFor(() => {
            expect(screen.getByText(/Name is required/i)).toBeDefined();
        });
    });

    it('does not call onSubmit when validation fails', () => {
        const onSubmit = vi.fn();
        render(<HorseForm onSubmit={onSubmit} onCancel={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: /Add horse/i }));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct data on valid submission', async () => {
        const onSubmit = vi.fn();
        render(<HorseForm onSubmit={onSubmit} onCancel={vi.fn()} />);

        fillValidForm();
        fireEvent.click(screen.getByRole('button', { name: /Add horse/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledOnce();
        });

        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.name).toBe('Rocky');
        expect(submitted.breed).toBe('Andalusian');
        expect(submitted.weight).toBe(500);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        const onCancel = vi.fn();
        render(<HorseForm onSubmit={vi.fn()} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(onCancel).toHaveBeenCalledOnce();
    });

    it('shows inline error for short name after blur', async () => {
        render(<HorseForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
        const nameInput = screen.getByLabelText(/Name/i);
        fireEvent.change(nameInput, { target: { value: 'A' } });
        fireEvent.blur(nameInput);

        await waitFor(() => {
            expect(screen.getByText(/at least 2/i)).toBeDefined();
        });
    });

    it('shows inline error for weight below 200 after blur', async () => {
        render(<HorseForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
        const weightInput = screen.getByLabelText(/Weight/i);
        fireEvent.change(weightInput, { target: { value: '50' } });
        fireEvent.blur(weightInput);

        await waitFor(() => {
            expect(screen.getByText(/200.*900|between 200/i)).toBeDefined();
        });
    });
});

describe('HorseForm – Edit mode', () => {
    it('renders "Edit Horse" title in edit mode', () => {
        render(<HorseForm initial={mockHorse} onSubmit={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText(/Edit Horse/i)).toBeDefined();
    });

    it('pre-fills fields with the horse data', () => {
        render(<HorseForm initial={mockHorse} onSubmit={vi.fn()} onCancel={vi.fn()} />);
        expect((screen.getByLabelText(/Name/i) as HTMLInputElement).value).toBe('Bella');
        expect((screen.getByLabelText(/Breed/i) as HTMLInputElement).value).toBe('Andalusian');
        expect((screen.getByLabelText(/Weight/i) as HTMLInputElement).value).toBe('480');
    });

    it('renders "Save changes" button in edit mode', () => {
        render(<HorseForm initial={mockHorse} onSubmit={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Save changes/i })).toBeDefined();
    });

    it('calls onSubmit with updated data', async () => {
        const onSubmit = vi.fn();
        render(<HorseForm initial={mockHorse} onSubmit={onSubmit} onCancel={vi.fn()} />);

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Storm' } });
        fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledOnce();
        });

        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.name).toBe('Storm');
        expect(submitted.breed).toBe('Andalusian'); // unchanged
    });

    it('does not include id in submitted data (it is HorseFormData, not Horse)', async () => {
        const onSubmit = vi.fn();
        render(<HorseForm initial={mockHorse} onSubmit={onSubmit} onCancel={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());

        const submitted = onSubmit.mock.calls[0][0];
        expect(submitted.id).toBeUndefined();
    });
});