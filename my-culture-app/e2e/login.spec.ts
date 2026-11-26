import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@myculture.app';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

// The login form is in the desktop navigation; the mobile menu is a drawer.
test.skip(
  ({ isMobile }) => isMobile,
  'Login flow is covered on desktop; mobile uses the same form.'
);

async function submitLogin(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Anmelden' }).first().click();
  await page.fill('#email', email);
  await page.fill('#password', password);
  const response = page.waitForResponse((r) =>
    r.url().endsWith('/api/auth/login')
  );
  await page
    .locator('#login-form')
    .getByRole('button', { name: 'Anmelden' })
    .click();
  return (await response).status();
}

const token = (page: Page) =>
  page.evaluate(() => localStorage.getItem('token'));

test.describe('Admin login', () => {
  test.beforeAll(() => {
    expect(
      ADMIN_PASSWORD,
      'SEED_ADMIN_PASSWORD must be set for the login tests'
    ).not.toBe('');
  });

  test('refuses a wrong password and stores nothing', async ({ page }) => {
    expect(await submitLogin(page, ADMIN_EMAIL, 'Wrong-Password-1')).toBe(401);
    expect(await token(page)).toBeNull();
  });

  test('logs in, keeps the session on reload, opens the dashboard and logs out', async ({
    page,
  }) => {
    expect(await submitLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD)).toBe(200);
    // The page stores the token after the response arrives.
    await expect.poll(() => token(page)).not.toBeNull();
    await expect(page.locator('.avatar').first()).toBeVisible();

    const me = page.waitForResponse((r) => r.url().endsWith('/api/auth/me'));
    await page.reload();
    expect((await me).status()).toBe(200);
    await expect(page.locator('.avatar').first()).toBeVisible();

    await page.locator('.avatar').first().click();
    await page.getByRole('link', { name: 'Dashboard' }).first().click();
    await page.waitForURL('**/dashboard/home');

    await page.goto('/');
    await page.locator('.avatar').first().click();
    await page.getByRole('button', { name: 'Abmelden' }).first().click();
    await expect.poll(() => token(page)).toBeNull();
  });

  test('a forged token is refused', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() =>
      localStorage.setItem('token', 'forged.token.value')
    );
    const me = page.waitForResponse((r) => r.url().endsWith('/api/auth/me'));
    await page.reload();
    expect((await me).status()).toBe(401);
    await expect(page.locator('.avatar')).toHaveCount(0);
  });
});
