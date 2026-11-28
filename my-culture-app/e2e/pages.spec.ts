import { test, expect } from '@playwright/test';

const publicPages = [
  { path: '/', heading: /Stärkung der Kultur/ },
  { path: '/organizations', heading: null },
  { path: '/join-us', heading: null },
  { path: '/impressum', heading: null },
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
