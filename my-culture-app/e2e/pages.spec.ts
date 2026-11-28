import { test, expect } from '@playwright/test';

const publicPages = [
  { path: '/', heading: /Stärkung der Kultur/ },
  { path: '/organizations', heading: null },
  { path: '/join-us', heading: null },
  { path: '/impressum', heading: /Impressum/ },
  { path: '/datenschutz', heading: /Datenschutzerklärung/ },
];

test.describe('Public pages', () => {
  for (const { path, heading } of publicPages) {
    test(`${path} renders with header and footer, without page errors`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(path);

      await expect(page.locator('nav').first()).toBeVisible();
      // The site footer (contentinfo); organisation cards have their own <footer>.
      await expect(page.getByRole('contentinfo')).toBeVisible();
      if (heading) {
        await expect(
          page.getByRole('heading', { level: 1 }).first()
        ).toHaveText(heading);
      }
      expect(errors).toEqual([]);
    });
  }
});

test('footer links lead to Impressum and Datenschutz', async ({ page }) => {
  // Not the start page: it is wider than a phone screen (known, open).
  await page.goto('/organizations');
  const footer = page.getByRole('contentinfo');
  await footer.getByRole('link', { name: 'Impressum' }).click();
  await expect(page).toHaveURL(/\/impressum$/);
  await expect(
    page.getByText('Vereinsregister 22292 (Amtsgericht Stendal)')
  ).toBeVisible();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Datenschutzerklärung' })
    .click();
  await expect(page).toHaveURL(/\/datenschutz$/);
  await expect(
    page.getByRole('heading', { name: 'Hinweis zur verantwortlichen Stelle' })
  ).toBeVisible();

  await footer.getByRole('link', { name: 'Datenschutz' }).click();
  await expect(page).toHaveURL(/\/datenschutz$/);
});

test('old /privacy link redirects to /datenschutz', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveURL(/\/datenschutz$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })
  ).toBeVisible();
});

test('favicon and touch icon are served', async ({ request }) => {
  for (const path of ['/logo/favicon.ico', '/logo/apple-touch-icon.png']) {
    expect((await request.get(path)).status()).toBe(200);
  }
});

test.describe('Dashboard', () => {
  test('redirects to the start page when not logged in', async ({ page }) => {
    await page.goto('/dashboard/home');
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });
});

test.describe('API', () => {
  test('health check reports the database as connected', async ({
    request,
  }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    expect((await response.json()).data.database).toBe('connected');
  });

  test('protected API routes refuse requests without a token', async ({
    request,
  }) => {
    const response = await request.get('/api/auth/me');
    expect(response.status()).toBe(401);
  });
});
