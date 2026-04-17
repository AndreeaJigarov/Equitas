
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

describe('RegisterForm Component', () => {
    it('should show an error if weight is non-positive', async () => {
        const mockOnRegister = vi.fn();
        render(<RegisterForm onRegister={mockOnRegister} />);

        // Find the weight input and enter -5
        const weightInput = screen.getByLabelText(/Weight/i);
        fireEvent.change(weightInput, { target: { value: '-5' } });

        // Try to submit
        const submitBtn = screen.getByRole('button', { name: /Register/i });
        fireEvent.click(submitBtn);

        // Verify the error message you added to the component appears
        expect(await screen.findByText(/Weight must be a positive number/i)).toBeDefined();
        expect(mockOnRegister).not.toHaveBeenCalled();
    });

    it('should keep the button disabled until disclaimer is checked', () => {
        render(<RegisterForm onRegister={() => {}} />);
        const submitBtn = screen.getByRole('button', { name: /Register/i });

        // Check initial state
        expect(submitBtn.hasAttribute('disabled')).toBe(true);

        // Check the box
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        // Button should now be enabled
        expect(submitBtn.hasAttribute('disabled')).toBe(false);
    });
});