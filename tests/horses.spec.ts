import { test, expect } from '@playwright/test';

test.describe('Equitas Horse Management', () => {
  
  test('should allow a user to add a new horse and see it in the list', async ({ page }) => {
    // 1. Navigate to the landing page
    await page.goto('http://localhost:5173/');

    // 2. Click "View Horses" to enter the app
    await page.getByRole('button', { name: 'View Horses' }).click();

    // 3. Verify we are on the horses page
    await expect(page).toHaveURL(/.*horses/);

    // 4. Click the "add new +" button
    await page.getByRole('button', { name: 'add new +' }).click();

    // 5. Fill out the form
    await page.getByPlaceholder('Horse name...').fill('Thunder');
    await page.getByPlaceholder('e.g. Andalusian').fill('Mustang');
    await page.locator('select[name="difficulty"]').selectOption('Hard');
    await page.locator('select[name="recommendedFor"]').selectOption('Adults');
    await page.getByPlaceholder('200–900').fill('500');
    await page.locator('input[name="dateOfBirth"]').fill('2020-05-20');
    await page.getByPlaceholder('Temperament and abilities of the horse...').fill('A high-energy stallion for experienced riders.');

    // 6. Submit the form
    await page.getByRole('button', { name: 'Add horse' }).click();

    // 7. Click Next to go to the second page where the new horse is
    await page.getByRole('button', { name: 'Next' }).click();

    // 8. Verify "Thunder" appears on page 2
    await expect(page.locator('body')).toContainText('Thunder');
  });
});

test('should allow editing an existing horse', async ({ page }) => {
  await page.goto('http://localhost:5173/horses');
  
  // Select first horse in list
  await page.locator('[class*="row"]').first().click();
  
  // Click Edit
  await page.getByRole('button', { name: 'Edit' }).click();
  
  // Change the breed
  await page.getByPlaceholder('e.g. Andalusian').clear();
  await page.getByPlaceholder('e.g. Andalusian').fill('Updated Breed');
  
  // Save
  await page.getByRole('button', { name: 'Save changes' }).click();
  
  // Verify the detail view shows the updated breed
  await expect(page.locator('[class*="viewPanel"]')).toContainText('Updated Breed');
});

test('should allow deleting a horse', async ({ page }) => {
  await page.goto('http://localhost:5173/horses');
  
  // Get the name of the first horse before deleting
  const firstName = await page.locator('[class*="rowName"]').first().innerText();
  
  // Select it
  await page.locator('[class*="row"]').first().click();
  
  // Click Delete, then confirm
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Yes, remove' }).click();
  
  // Verify it's gone from the list
  await expect(page.locator('body')).not.toContainText(firstName);
});


test('should remember last viewed horse after page refresh', async ({ page }) => {
  await page.goto('http://localhost:5173/horses');
  
  // Select a horse
  await page.locator('[class*="row"]').first().click();
  
  // Get its name
  const horseName = await page.locator('[class*="viewName"]').innerText();
  
  // Reload the page
  await page.reload();
  
  // The same horse should still be selected thanks to the cookie
  await expect(page.locator('[class*="viewName"]')).toHaveText(horseName);
});