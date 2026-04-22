import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

// Helper: targetăm inputurile după atributul name (labelurile nu au htmlFor)
const getInput = (name: string) =>
    document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;

const fillValidForm = () => {
    fireEvent.change(getInput('fullName'), { target: { value: 'John Doe' } });
    fireEvent.change(getInput('mobile'), { target: { value: '0712345678' } });
    fireEvent.change(getInput('weight'), { target: { value: '75' } });
    fireEvent.change(getInput('dob'), { target: { value: '1990-05-15' } });
};

describe('RegisterForm', () => {
    // ── DISCLAIMER CHECKBOX ───────────────────────────────────────────────
    it('submit button is disabled by default (disclaimer not checked)', () => {
        render(<RegisterForm onRegister={() => {}} />);
        expect(screen.getByRole('button', { name: /Register/i })).toBeDisabled();
    });

    it('submit button becomes enabled after checking the disclaimer', () => {
        render(<RegisterForm onRegister={() => {}} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(screen.getByRole('button', { name: /Register/i })).not.toBeDisabled();
    });

    it('submit button becomes disabled again if disclaimer is unchecked', () => {
        render(<RegisterForm onRegister={() => {}} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        fireEvent.click(checkbox);
        expect(screen.getByRole('button', { name: /Register/i })).toBeDisabled();
    });

    // ── EMPTY FIELDS VALIDATION ───────────────────────────────────────────
    it('shows "fill in all fields" error when submitting empty form with disclaimer checked', async () => {
        render(<RegisterForm onRegister={() => {}} />);
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Please fill in all fields/i)).toBeDefined();
    });

    it('does not call onRegister when fields are empty', () => {
        const mockOnRegister = vi.fn();
        render(<RegisterForm onRegister={mockOnRegister} />);
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(mockOnRegister).not.toHaveBeenCalled();
    });

    // ── WEIGHT VALIDATION ─────────────────────────────────────────────────
    it('shows error for non-positive weight (-5)', async () => {
        const mockOnRegister = vi.fn();
        render(<RegisterForm onRegister={mockOnRegister} />);
        fireEvent.change(getInput('fullName'), { target: { value: 'John' } });
        fireEvent.change(getInput('mobile'), { target: { value: '0712345678' } });
        fireEvent.change(getInput('weight'), { target: { value: '-5' } });
        fireEvent.change(getInput('dob'), { target: { value: '1990-01-01' } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Weight must be a positive number/i)).toBeDefined();
        expect(mockOnRegister).not.toHaveBeenCalled();
    });

    it('shows error for weight of 0', async () => {
        render(<RegisterForm onRegister={() => {}} />);
        fireEvent.change(getInput('fullName'), { target: { value: 'John' } });
        fireEvent.change(getInput('mobile'), { target: { value: '0712345678' } });
        fireEvent.change(getInput('weight'), { target: { value: '0' } });
        fireEvent.change(getInput('dob'), { target: { value: '1990-01-01' } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Weight must be a positive number/i)).toBeDefined();
    });

    // ── MOBILE VALIDATION ─────────────────────────────────────────────────
    it('shows error for mobile that is not 10 digits', async () => {
        render(<RegisterForm onRegister={() => {}} />);
        fireEvent.change(getInput('fullName'), { target: { value: 'John' } });
        fireEvent.change(getInput('mobile'), { target: { value: '12345' } });
        fireEvent.change(getInput('weight'), { target: { value: '70' } });
        fireEvent.change(getInput('dob'), { target: { value: '1990-01-01' } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Mobile number must be exactly 10 digits/i)).toBeDefined();
    });

    it('shows error for mobile with letters', async () => {
        render(<RegisterForm onRegister={() => {}} />);
        fireEvent.change(getInput('fullName'), { target: { value: 'John' } });
        fireEvent.change(getInput('mobile'), { target: { value: 'abcdefghij' } });
        fireEvent.change(getInput('weight'), { target: { value: '70' } });
        fireEvent.change(getInput('dob'), { target: { value: '1990-01-01' } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Mobile number must be exactly 10 digits/i)).toBeDefined();
    });

    // ── DATE OF BIRTH VALIDATION ──────────────────────────────────────────
    it('shows error when date of birth is in the future', async () => {
        render(<RegisterForm onRegister={() => {}} />);
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        fireEvent.change(getInput('fullName'), { target: { value: 'John' } });
        fireEvent.change(getInput('mobile'), { target: { value: '0712345678' } });
        fireEvent.change(getInput('weight'), { target: { value: '70' } });
        fireEvent.change(getInput('dob'), { target: { value: future.toISOString().split('T')[0] } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Date of Birth cannot be in the future/i)).toBeDefined();
    });

    // ── SUCCESS FLOW ──────────────────────────────────────────────────────
    it('calls onRegister when all fields are valid and disclaimer is accepted', async () => {
        const mockOnRegister = vi.fn();
        render(<RegisterForm onRegister={mockOnRegister} />);
        fillValidForm();
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        await waitFor(() => {
            expect(mockOnRegister).toHaveBeenCalledOnce();
        });
    });

    // ── CLEAR ERROR ON TYPING ─────────────────────────────────────────────
    it('clears the error message when the user starts typing after an error', async () => {
        render(<RegisterForm onRegister={() => {}} />);
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(await screen.findByText(/Please fill in all fields/i)).toBeDefined();

        fireEvent.change(getInput('fullName'), { target: { value: 'A' } });
        expect(screen.queryByText(/Please fill in all fields/i)).toBeNull();
    });
});