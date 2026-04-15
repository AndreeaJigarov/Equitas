import { test, expect } from '@playwright/test';

// Skip every test in this file on Mobile Safari —
// the responsive layout hides the horse list when a panel is open,
// which requires a completely different interaction flow.
//test.skip(({ isMobile }) => isMobile, 'Mobile layout tested separately');

test.describe('Equitas Horse Management', () => {
    // This block ONLY runs on desktop projects
    test.skip(({ isMobile }) => isMobile, 'Mobile layout handled below');
    test.beforeEach(async ({ page }) => {
        await page.goto('/horses');
        await expect(page.getByRole('heading', { name: 'Horses' })).toBeVisible();
    });

    // ─── ADD ──────────────────────────────────────────────────────────────────

    test('should allow a user to add a new horse and see it in the list', async ({ page }) => {
        // Open the add form
        await page.getByRole('button', { name: 'add new +' }).click();

        // Wait for the inline form to appear
        await expect(page.getByPlaceholder('Horse name...')).toBeVisible();

        // Fill every required field so validation passes
        await page.getByPlaceholder('Horse name...').fill('Thunder');
        await page.getByPlaceholder('e.g. Andalusian').fill('Mustang');
        await page.locator('select[name="difficulty"]').selectOption('Hard');
        await page.locator('select[name="recommendedFor"]').selectOption('Adults');

        // weight field — the inline form uses type="number" with placeholder "200–900"
        await page.locator('input[name="weight"]').fill('500');

        // date of birth
        await page.locator('input[name="dateOfBirth"]').fill('2020-05-20');

        // about / description textarea
        await page.locator('textarea[name="about"]').fill(
            'A high-energy stallion for experienced riders.'
        );

        // Submit
        await page.getByRole('button', { name: 'Add horse' }).click();

        // Thunder is the 7th horse — click Next to reach page 2
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.locator('body')).toContainText('Thunder');
    });

    // ─── EDIT ─────────────────────────────────────────────────────────────────

    test('should allow editing an existing horse', async ({ page }) => {
        // Use [class*="rowName"] — this only matches the horse name spans,
        // not the pagination row or badge row
        const firstHorseName = page.locator('[class*="rowName"]').first();
        await firstHorseName.scrollIntoViewIfNeeded();
        await firstHorseName.click();

        // Wait for the detail view to load before clicking Edit
        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await page.getByRole('button', { name: 'Edit' }).click();

        // Wait for the edit form
        await expect(page.getByPlaceholder('e.g. Andalusian')).toBeVisible();

        // Clear and retype the breed
        await page.getByPlaceholder('e.g. Andalusian').clear();
        await page.getByPlaceholder('e.g. Andalusian').fill('Updated Breed');

        await page.getByRole('button', { name: 'Save changes' }).click();

        // After saving, the view panel reappears
        await expect(page.locator('[class*="viewPanel"]')).toContainText('Updated Breed');
    });

    // ─── DELETE ───────────────────────────────────────────────────────────────

    test('should allow deleting a horse', async ({ page }) => {
        // Grab Bella's name before deleting so we can assert it's gone
        const firstName = await page.locator('[class*="rowName"]').first().innerText();

        await page.locator('[class*="rowName"]').first().click();

        // Wait for the Delete button before clicking
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
        await page.getByRole('button', { name: 'Delete' }).click();

        await expect(page.getByRole('button', { name: 'Yes, remove' })).toBeVisible();
        await page.getByRole('button', { name: 'Yes, remove' }).click();

        // The name should be gone from the list
        await expect(page.locator('body')).not.toContainText(firstName);
    });

    // ─── COOKIE PERSISTENCE ───────────────────────────────────────────────────

    test('should remember last viewed horse after page refresh', async ({ page }) => {
        await page.locator('[class*="rowName"]').first().click();

        // Wait for the view panel to render before reading the name
        const viewName = page.locator('[class*="viewName"]');
        await expect(viewName).toBeVisible();
        const horseName = await viewName.innerText();

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Cookie should restore the selection; panel should show the same horse
        await expect(page.locator('[class*="viewName"]')).toHaveText(horseName);
    });

});

// ─── MOBILE ───────────────────────────────────────────────────────────────────
// Separate describe block that only runs on mobile viewports.
// The panel-switching layout means the list and detail view are never on screen
// at the same time, so the interaction flow is different.

test.describe('Equitas Horse Management — mobile', () => {

    test.skip(({ isMobile }) => !isMobile, 'Desktop layout tested above');

    test.beforeEach(async ({ page }) => {
        await page.goto('/horses');
        await expect(page.getByRole('heading', { name: 'Horses' })).toBeVisible();
    });

    test('should show detail panel after selecting a horse', async ({ page }) => {
        // On mobile the list is visible first; tap the horse name
        await page.locator('[class*="rowName"]').first().click();

        // The list panel disappears; the detail panel should now be visible
        await expect(page.locator('[class*="viewName"]')).toBeVisible();
    });

    test('should return to list after pressing the close button', async ({ page }) => {
        await page.locator('[class*="rowName"]').first().click();
        await expect(page.locator('[class*="viewName"]')).toBeVisible();

        // The "✕" button (mobileClose) sends the user back to the list
        await page.getByRole('button', { name: '✕' }).click();

        // The list should reappear
        await expect(page.locator('[class*="rowName"]').first()).toBeVisible();
    });

});