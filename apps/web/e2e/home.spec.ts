import { expect, test } from '@playwright/test';

test('displays the scaffold page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rent Hub');
});
