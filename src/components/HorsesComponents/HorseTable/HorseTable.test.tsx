import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HorseTable } from './HorseTable';
import { type Horse } from '../../../types/Horse';

const makeHorse = (id: string, name: string, difficulty: Horse['difficulty'] = 'Easy'): Horse => ({
    id,
    name,
    breed: 'Breed',
    difficulty,
    weight: 400,
    dateOfBirth: '2015-01-01',
    about: 'A good horse.',
    isAvailable: true,
    inTraining: false,
    recommendedFor: 'Both',
});

const horses7 = Array.from({ length: 7 }, (_, i) =>
    makeHorse(String(i + 1), `Horse${i + 1}`)
);

describe('HorseTable', () => {
    // ── RENDERING ─────────────────────────────────────────────────────────
    it('renders the "Horses" title', () => {
        render(<HorseTable horses={[]} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />);
        expect(screen.getByText('Horses')).toBeDefined();
    });

    it('shows "No horses yet." when the list is empty', () => {
        render(<HorseTable horses={[]} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />);
        expect(screen.getByText(/No horses yet/i)).toBeDefined();
    });

    it('renders horse names for a non-empty list', () => {
        const list = [makeHorse('1', 'Bella'), makeHorse('2', 'Storm')];
        render(<HorseTable horses={list} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />);
        expect(screen.getByText('Bella')).toBeDefined();
        expect(screen.getByText('Storm')).toBeDefined();
    });

    it('renders the first letter of each horse name as the avatar', () => {
        render(
            <HorseTable
                horses={[makeHorse('1', 'Bella')]}
                selectedId={null}
                onSelect={vi.fn()}
                onAddNew={vi.fn()}
            />
        );
        expect(screen.getByText('B')).toBeDefined();
    });

    it('renders difficulty badges for each horse', () => {
        const list = [
            makeHorse('1', 'Easy Horse', 'Easy'),
            makeHorse('2', 'Hard Horse', 'Hard'),
        ];
        render(<HorseTable horses={list} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />);
        expect(screen.getByText('Easy')).toBeDefined();
        expect(screen.getByText('Hard')).toBeDefined();
    });

    // ── INTERACTION ───────────────────────────────────────────────────────
    it('calls onSelect with the correct id when a row is clicked', () => {
        const onSelect = vi.fn();
        const list = [makeHorse('42', 'Rocky')];
        render(<HorseTable horses={list} selectedId={null} onSelect={onSelect} onAddNew={vi.fn()} />);
        fireEvent.click(screen.getByText('Rocky'));
        expect(onSelect).toHaveBeenCalledWith('42');
    });

    it('calls onAddNew when "add new +" button is clicked', () => {
        const onAddNew = vi.fn();
        render(<HorseTable horses={[]} selectedId={null} onSelect={vi.fn()} onAddNew={onAddNew} />);
        fireEvent.click(screen.getByRole('button', { name: /add new/i }));
        expect(onAddNew).toHaveBeenCalledOnce();
    });

    // ── PAGINATION ────────────────────────────────────────────────────────
    it('shows only 6 horses per page (PAGE_SIZE)', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        // Page 1 has horses 1–6; Horse7 should NOT be visible
        expect(screen.getByText('Horse1')).toBeDefined();
        expect(screen.getByText('Horse6')).toBeDefined();
        expect(screen.queryByText('Horse7')).toBeNull();
    });

    it('shows page indicator "1 / 2" for 7 horses', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        expect(screen.getByText('1 / 2')).toBeDefined();
    });

    it('"Prev" button is disabled on page 1', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
    });

    it('"Next" button is enabled on page 1 when there are more pages', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    });

    it('navigates to page 2 and shows Horse7 after clicking "Next"', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        expect(screen.getByText('Horse7')).toBeDefined();
        expect(screen.queryByText('Horse1')).toBeNull();
    });

    it('"Next" is disabled on the last page', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
    });

    it('"Prev" is enabled on page 2 and goes back', () => {
        render(
            <HorseTable horses={horses7} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        fireEvent.click(screen.getByRole('button', { name: /Prev/i }));
        expect(screen.getByText('Horse1')).toBeDefined();
        expect(screen.getByText('1 / 2')).toBeDefined();
    });

    it('shows "1 / 1" and both buttons disabled for 6 or fewer horses', () => {
        const sixHorses = horses7.slice(0, 6);
        render(
            <HorseTable horses={sixHorses} selectedId={null} onSelect={vi.fn()} onAddNew={vi.fn()} />
        );
        expect(screen.getByText('1 / 1')).toBeDefined();
        expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
    });
});