import { test, expect } from '@playwright/test';

test('menu bar sticks and the small logo appears once the big one scrolls away', async ({
  page,
}) => {
  await page.goto('/organizations');
  const bar = page.locator('header').first();
  const compactLogo = page.getByTestId('compact-logo');

  // At the top: big logo visible, small logo hidden and not focusable.
  await expect(
    page.getByRole('link', { name: 'Startseite' }).first()
  ).toBeVisible();
  await expect(compactLogo).toHaveCSS('opacity', '0');
  await expect(compactLogo).toHaveAttribute('inert', '');

  await page.mouse.wheel(0, 1200);
  await expect
    .poll(() => bar.evaluate((el) => el.getBoundingClientRect().top))
    .toBe(0);
  await expect(compactLogo).toHaveCSS('opacity', '1');
  await expect(compactLogo).not.toHaveAttribute('inert');

  // The small logo leads home.
  await compactLogo.click();
  await expect(page).toHaveURL(/\/$/);
});
