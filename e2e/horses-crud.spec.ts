import { test, expect, type Page } from '@playwright/test';

const goToHorses = async (page: Page) => {
    await page.goto('/horses');
    // Așteaptă să se încarce lista
    await expect(page.locator('[class*="row"]').first()).toBeVisible();
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. MASTER / DETAIL NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Master–Detail Navigation', () => {
    test('the horse list is visible on the horses page', async ({ page }) => {
        await goToHorses(page);
        await expect(page.getByRole('heading', { name: 'Horses' })).toBeVisible();
        await expect(page.locator('[class*="row"]').first()).toBeVisible();
    });

    test('clicking a horse row opens the detail view', async ({ page }) => {
        await goToHorses(page);
        const firstRow = page.locator('[class*="row"]').first();
        await firstRow.click();
        // Folosim h2 cu clasa viewName — specific și unic
        await expect(page.locator('h2[class*="viewName"]')).toBeVisible();
    });

    test('detail view shows a breed field for the selected horse', async ({ page }) => {
        await goToHorses(page);
        await page.locator('[class*="row"]').first().click();
        await expect(page.getByText(/Breed/i).first()).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ADD HORSE (CRUD – CREATE)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Add Horse (Create)', () => {
    test('clicking "add new +" opens the add form', async ({ page }) => {
        await goToHorses(page);
        await page.getByRole('button', { name: /add new/i }).click();
        await expect(page.getByPlaceholder(/Horse name/i)).toBeVisible();
    });

    test('submitting an empty add form shows validation errors', async ({ page }) => {
        await goToHorses(page);
        await page.getByRole('button', { name: /add new/i }).click();
        await page.getByRole('button', { name: /Add horse/i }).click();
        await expect(page.getByText(/required/i).first()).toBeVisible();
    });

    test('adding a valid horse creates it and it appears in the table', async ({ page }) => {
        await goToHorses(page);
        //const countBefore = await page.locator('[class*="row"]').count();

        await page.getByRole('button', { name: /add new/i }).click();

        await page.getByPlaceholder(/Horse name/i).fill('PlaywrightHorse');
        await page.getByPlaceholder(/e.g. Andalusian/i).fill('Thoroughbred');
        await page.locator('input[name="weight"]').fill('500');
        await page.locator('input[name="dateOfBirth"]').fill('2018-06-15');
        await page.getByPlaceholder(/Temperament and abilities/i).fill('A fantastic horse for end-to-end testing purposes.');

        await page.getByRole('button', { name: /Add horse/i }).click();

        // Așteptăm să revenim la lista de cai (mode='none')
        await expect(page.getByRole('button', { name: /add new/i })).toBeVisible();

        // Calul nou poate fi pe ultima pagină — navigăm până îl găsim
        const totalPages = await page.locator('[class*="pageText"]').textContent();
        const lastPage = parseInt(totalPages?.split('/')[1]?.trim() ?? '1');
        for (let i = 1; i < lastPage; i++) {
            await page.getByRole('button', { name: /Next/i }).click();
        }

        await expect(page.locator('[class*="rowName"]').filter({ hasText: 'PlaywrightHorse' })).toBeVisible();
        const countAfter = await page.locator('[class*="row"]').count();
        expect(countAfter).toBeGreaterThan(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. EDIT HORSE (CRUD – UPDATE)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edit Horse (Update)', () => {
    test('clicking Edit button opens the edit form with pre-filled data', async ({ page }) => {
        await goToHorses(page);
        await page.locator('[class*="row"]').first().click();
        await page.getByRole('button', { name: /Edit/i }).click();
        await expect(page.getByRole('button', { name: /Save changes/i })).toBeVisible();
    });

    test('saving an edit updates the horse name in the list', async ({ page }) => {
        await goToHorses(page);
        await page.locator('[class*="row"]').first().click();
        await page.getByRole('button', { name: /Edit/i }).click();

        const nameInput = page.getByPlaceholder(/Horse name/i);
        await nameInput.clear();
        await nameInput.fill('EditedNameE2E');

        await page.getByRole('button', { name: /Save changes/i }).click();

        // Pe desktop: rowName apare în tabel alături de detail view
        // Pe mobile: trebuie să închidem detail view ca să vedem tabelul
        // Verificăm în h2 (detail view) sau în rowName (tabel) — oricare e vizibil
        const inDetailView = page.locator('h2[class*="viewName"]').filter({ hasText: 'EditedNameE2E' });
        const inTable = page.locator('[class*="rowName"]').filter({ hasText: 'EditedNameE2E' });
        await expect(inDetailView.or(inTable).first()).toBeVisible();
    });

    test('cancelling edit does not change the horse', async ({ page }) => {
        await goToHorses(page);
        const firstRow = page.locator('[class*="row"]').first();
        const originalName = await firstRow.locator('[class*="rowName"]').textContent();

        await firstRow.click();
        await page.getByRole('button', { name: /Edit/i }).click();

        const nameInput = page.getByPlaceholder(/Horse name/i);
        await nameInput.clear();
        await nameInput.fill('ShouldNotSave');

        await page.getByRole('button', { name: /Cancel/i }).click();

        // Verificăm că numele original e în tabel
        await expect(page.locator('[class*="rowName"]').filter({ hasText: originalName! })).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. DELETE HORSE (CRUD – DELETE)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Delete Horse', () => {
    test('clicking Delete shows a confirmation prompt', async ({ page }) => {
        await goToHorses(page);
        await page.locator('[class*="row"]').first().click();
        await page.getByRole('button', { name: /Delete/i }).click();
        // Componenta afișează "Remove <name>?" și butonul "Yes, remove"
        await expect(page.locator('[class*="confirmRow"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /Yes, remove/i })).toBeVisible();
    });

    test('confirming delete removes the horse from the list', async ({ page }) => {
        await goToHorses(page);
        const firstName = await page.locator('[class*="rowName"]').first().textContent();
        const countBefore = await page.locator('[class*="row"]').count();

        await page.locator('[class*="row"]').first().click();
        await page.getByRole('button', { name: /Delete/i }).click();
        await page.getByRole('button', { name: /Yes, remove/i }).click();

        await expect(page.locator('[class*="rowName"]').filter({ hasText: firstName! })).not.toBeVisible({ timeout: 3000 });
        const countAfter = await page.locator('[class*="row"]').count();
        expect(countAfter).toBeLessThan(countBefore);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Pagination', () => {
    test('page indicator shows "1 / N" on load', async ({ page }) => {
        await goToHorses(page);
        await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();
    });

    test('"Prev" button is disabled on the first page', async ({ page }) => {
        await goToHorses(page);
        await expect(page.getByRole('button', { name: /Prev/i })).toBeDisabled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. VALIDATION IN DETAIL FORM
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Form Validation (Add form)', () => {
    test('shows breed error when breed is missing', async ({ page }) => {
        await goToHorses(page);
        await page.getByRole('button', { name: /add new/i }).click();
        await page.getByPlaceholder(/Horse name/i).fill('ValidName');
        await page.getByRole('button', { name: /Add horse/i }).click();
        await expect(page.getByText(/Breed is required/i)).toBeVisible();
    });

    test('shows weight error for out-of-range value', async ({ page }) => {
        await goToHorses(page);
        await page.getByRole('button', { name: /add new/i }).click();
        await page.getByPlaceholder(/Horse name/i).fill('ValidName');
        await page.getByPlaceholder(/e.g. Andalusian/i).fill('Breed');
        await page.locator('input[name="weight"]').fill('50');
        await page.getByRole('button', { name: /Add horse/i }).click();
        await expect(page.getByText(/200.*900|between 200/i)).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. STATISTICS PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Statistics Page', () => {
    test('the Statistics page loads and shows the horse analytics heading', async ({ page }) => {
        await page.goto('/statistics');
        await expect(page.getByRole('heading', { name: /Horse Analytics/i })).toBeVisible();
    });

    test('the pie and bar charts are rendered', async ({ page }) => {
        await page.goto('/statistics');
        // Așteptăm recharts să rendereze SVG
        await expect(page.locator('svg').first()).toBeVisible({ timeout: 10000 });
    });

    test('session time is displayed on the statistics page', async ({ page }) => {
        await page.goto('/statistics');
        await expect(page.getByText(/Current Session:/i)).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. REGISTER FORM
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Register Page', () => {
    test('register page loads and shows the form', async ({ page }) => {
        await page.goto('/register');
        await expect(page.getByRole('button', { name: /Register/i })).toBeVisible();
    });

    test('submit button is disabled before disclaimer is accepted', async ({ page }) => {
        await page.goto('/register');
        await expect(page.getByRole('button', { name: /Register/i })).toBeDisabled();
    });

    test('submit button enables after checking the disclaimer', async ({ page }) => {
        await page.goto('/register');
        await page.getByRole('checkbox').click();
        await expect(page.getByRole('button', { name: /Register/i })).not.toBeDisabled();
    });

    test('shows validation error for invalid mobile number', async ({ page }) => {
        await page.goto('/register');
        await page.locator('input[name="fullName"]').fill('John Doe');
        await page.locator('input[name="mobile"]').fill('123');
        await page.locator('input[name="weight"]').fill('70');
        await page.locator('input[name="dob"]').fill('1990-01-01');
        await page.getByRole('checkbox').click();
        await page.getByRole('button', { name: /Register/i }).click();
        await expect(page.getByText(/10 digits/i)).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. COOKIE – LAST VIEWED HORSE PERSISTS ON REFRESH
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Cookie: last viewed horse preference', () => {
    test('detail view opens automatically for the last viewed horse after refresh', async ({ page }) => {
        await goToHorses(page);

        const firstRow = page.locator('[class*="row"]').first();
        const horseName = await firstRow.locator('[class*="rowName"]').textContent();
        await firstRow.click();

        // Verificăm că s-a deschis detail view
        await expect(page.locator('h2[class*="viewName"]')).toBeVisible();

        await page.reload();

        // După reload, același cal trebuie să fie selectat (din cookie)
        await expect(page.locator('h2[class*="viewName"]').filter({ hasText: horseName! })).toBeVisible({ timeout: 5000 });
    });
});