import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HorseDetailView } from './HorseDetailView';
import { type Horse } from '../../../types/Horse';

// Mock AnimatedHorse ca să nu avem probleme cu CSS animations în jsdom
vi.mock('../AnimatedHorse/AnimatedHorse', () => ({
    AnimatedHorse: () => <div data-testid="animated-horse" />,
}));

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

const defaultProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSubmitAdd: vi.fn(),
    onSubmitEdit: vi.fn(),
    onCancel: vi.fn(),
};

describe('HorseDetailView – mode: none', () => {
    it('renders the empty state with animated horse', () => {
        render(<HorseDetailView mode="none" {...defaultProps} />);
        expect(screen.getByTestId('animated-horse')).toBeDefined();
    });

    it('shows "Select a horse to view details" text', () => {
        render(<HorseDetailView mode="none" {...defaultProps} />);
        expect(screen.getByText(/Select a horse to view details/i)).toBeDefined();
    });

    it('shows hint to use "add new +"', () => {
        render(<HorseDetailView mode="none" {...defaultProps} />);
        expect(screen.getByText(/add new/i)).toBeDefined();
    });
});

describe('HorseDetailView – mode: view', () => {
    it('renders null when mode is view but no horse is provided', () => {
        const { container } = render(<HorseDetailView mode="view" {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('displays the horse name', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText('Bella')).toBeDefined();
    });

    it('displays the horse breed', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText('Andalusian')).toBeDefined();
    });

    it('displays the horse weight', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText('480 kg')).toBeDefined();
    });

    it('displays the horse about text', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText(/Calm and responsive mare/i)).toBeDefined();
    });

    it('displays the horse id', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText(/#1/)).toBeDefined();
    });

    it('shows "Available" badge when horse is available and not in training', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText('Available')).toBeDefined();
    });

    it('shows "In Training" badge when horse is in training', () => {
        const trainingHorse = { ...mockHorse, inTraining: true, isAvailable: false };
        render(<HorseDetailView mode="view" horse={trainingHorse} {...defaultProps} />);
        expect(screen.getByText('In Training')).toBeDefined();
    });

    it('shows "Unavailable" badge when horse is not available and not in training', () => {
        const unavailableHorse = { ...mockHorse, isAvailable: false, inTraining: false };
        render(<HorseDetailView mode="view" horse={unavailableHorse} {...defaultProps} />);
        expect(screen.getByText('Unavailable')).toBeDefined();
    });

    it('shows "All riders" when recommendedFor is Both', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText('All riders')).toBeDefined();
    });

    it('shows "Adults" when recommendedFor is Adults', () => {
        const adultsHorse = { ...mockHorse, recommendedFor: 'Adults' as const };
        render(<HorseDetailView mode="view" horse={adultsHorse} {...defaultProps} />);
        expect(screen.getByText('Adults')).toBeDefined();
    });

    it('renders Edit and Delete buttons', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Edit/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /Delete/i })).toBeDefined();
    });

    it('calls onEdit when Edit button is clicked', () => {
        const onEdit = vi.fn();
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} onEdit={onEdit} />);
        fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
        expect(onEdit).toHaveBeenCalledOnce();
    });

    it('shows delete confirmation when Delete button is clicked', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
        expect(screen.getByText(/Remove/, { selector: 'p' })).toBeDefined();
        expect(screen.getByRole('button', { name: /Yes, remove/i })).toBeDefined();
    });

    it('calls onDelete with horse id when "Yes, remove" is confirmed', () => {
        const onDelete = vi.fn();
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} onDelete={onDelete} />);
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
        fireEvent.click(screen.getByRole('button', { name: /Yes, remove/i }));
        expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('hides delete confirmation when Cancel is clicked in confirm row', () => {
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
        // Click the small cancel inside confirm row
        const cancelBtns = screen.getAllByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelBtns[0]);
        // Edit and Delete should be visible again
        expect(screen.getByRole('button', { name: /Edit/i })).toBeDefined();
    });

    it('calls onCancel when mobile close button (✕) is clicked', () => {
        const onCancel = vi.fn();
        render(<HorseDetailView mode="view" horse={mockHorse} {...defaultProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole('button', { name: '✕' }));
        expect(onCancel).toHaveBeenCalledOnce();
    });
});

describe('HorseDetailView – mode: add', () => {
    it('renders the add form with "+" avatar', () => {
        render(<HorseDetailView mode="add" {...defaultProps} />);
        expect(screen.getByText('+')).toBeDefined();
    });

    it('renders "Add horse" submit button', () => {
        render(<HorseDetailView mode="add" {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Add horse/i })).toBeDefined();
    });

    it('shows "ID: auto-generated" text', () => {
        render(<HorseDetailView mode="add" {...defaultProps} />);
        expect(screen.getByText(/auto-generated/i)).toBeDefined();
    });

    it('shows validation errors when submitted empty', async () => {
        render(<HorseDetailView mode="add" {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Add horse/i }));
        await waitFor(() => {
            expect(screen.getByText(/Name is required/i)).toBeDefined();
        });
    });

    it('does not call onSubmitAdd when form is invalid', () => {
        const onSubmitAdd = vi.fn();
        render(<HorseDetailView mode="add" {...defaultProps} onSubmitAdd={onSubmitAdd} />);
        fireEvent.click(screen.getByRole('button', { name: /Add horse/i }));
        expect(onSubmitAdd).not.toHaveBeenCalled();
    });

    it('calls onSubmitAdd with correct data on valid submission', async () => {
        const onSubmitAdd = vi.fn();
        render(<HorseDetailView mode="add" {...defaultProps} onSubmitAdd={onSubmitAdd} />);

        fireEvent.change(screen.getByPlaceholderText(/Horse name/i), { target: { value: 'Rocky' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. Andalusian/i), { target: { value: 'Thoroughbred' } });
        fireEvent.change(document.querySelector('input[name="weight"]')!, { target: { value: '500' } });
        fireEvent.change(document.querySelector('input[name="dateOfBirth"]')!, { target: { value: '2018-03-10' } });
        fireEvent.change(screen.getByPlaceholderText(/Temperament and abilities/i), { target: { value: 'A wonderful and calm horse for all riders.' } });

        fireEvent.click(screen.getByRole('button', { name: /Add horse/i }));

        await waitFor(() => {
            expect(onSubmitAdd).toHaveBeenCalledOnce();
        });

        const submitted = onSubmitAdd.mock.calls[0][0];
        expect(submitted.name).toBe('Rocky');
        expect(submitted.breed).toBe('Thoroughbred');
        expect(submitted.weight).toBe(500);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        const onCancel = vi.fn();
        render(<HorseDetailView mode="add" {...defaultProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(onCancel).toHaveBeenCalledOnce();
    });
});

describe('HorseDetailView – mode: edit', () => {
    it('renders "Save changes" button in edit mode', () => {
        render(<HorseDetailView mode="edit" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Save changes/i })).toBeDefined();
    });

    it('pre-fills the name field with the horse name', () => {
        render(<HorseDetailView mode="edit" horse={mockHorse} {...defaultProps} />);
        const nameInput = screen.getByPlaceholderText(/Horse name/i) as HTMLInputElement;
        expect(nameInput.value).toBe('Bella');
    });

    it('shows the horse id in edit mode', () => {
        render(<HorseDetailView mode="edit" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText(/ID: #1/)).toBeDefined();
    });

    it('calls onSubmitEdit with updated data on valid save', async () => {
        const onSubmitEdit = vi.fn();
        render(<HorseDetailView mode="edit" horse={mockHorse} {...defaultProps} onSubmitEdit={onSubmitEdit} />);

        const nameInput = screen.getByPlaceholderText(/Horse name/i);
        fireEvent.change(nameInput, { target: { value: 'Storm' } });
        fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

        await waitFor(() => {
            expect(onSubmitEdit).toHaveBeenCalledOnce();
        });

        expect(onSubmitEdit.mock.calls[0][0].name).toBe('Storm');
    });

    it('shows first letter of horse name as avatar in edit mode', () => {
        render(<HorseDetailView mode="edit" horse={mockHorse} {...defaultProps} />);
        expect(screen.getByText('B')).toBeDefined();
    });
});