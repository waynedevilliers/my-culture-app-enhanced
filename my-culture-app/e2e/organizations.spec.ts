import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@myculture.app';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

// One full run on desktop is enough; mobile uses the same pages.
test.skip(({ isMobile }) => isMobile, 'Covered on desktop.');

async function loginAsSuperAdmin(page: Page) {
  const response = await page.request.post('/api/auth/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(response.status()).toBe(200);
  const { token } = (await response.json()).data;
  await page.goto('/');
  await page.evaluate((t) => localStorage.setItem('token', t), token);
}

test('Join us application -> super admin approves -> organisation is public', async ({
  page,
}) => {
  const name = `E2E Kulturverein ${Date.now()}`;

  // 1. Apply through the Join us form.
  await page.goto('/join-us');
  await page.fill('input[name="organizationName"]', name);
  await page.selectOption('select[name="organizationType"]', { index: 1 });
  await page.fill(
    'textarea[name="description"]',
    'Ein Verein für Musik und Theater in der Nachbarschaft.'
  );
  await page.fill('input[name="location"]', 'Berlin');
  await page.fill('input[name="adminName"]', 'Ada Admin');
  await page.fill('input[name="adminEmail"]', 'ada@example.com');
  const applied = page.waitForResponse((r) =>
    r.url().endsWith('/api/organizations/apply')
  );
  await page.getByRole('button', { name: 'Antrag einreichen' }).click();
  expect((await applied).status()).toBe(201);
  await expect(page.getByText('We will review it')).toBeVisible();

  // 2. Not public while pending.
  const pending = await page.request.get('/api/organizations/published');
  expect(
    (await pending.json()).map((o: { name: string }) => o.name)
  ).not.toContain(name);

  // 3. Super admin approves it on the Applications page.
  await loginAsSuperAdmin(page);
  await page.goto('/dashboard/organization-applications');
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();
  const approved = page.waitForResponse((r) => r.url().endsWith('/approve'));
  await row.getByTitle('Genehmigen').click();
  expect((await approved).status()).toBe(200);
  await expect(row).toHaveCount(0);

  // 4. Public: listed on the organisations page and has a detail page.
  await page.goto('/organizations');
  const card = page.getByText(name).first();
  await expect(card).toBeVisible();

  const list = await page.request.get('/api/organizations/published');
  const created = (await list.json()).find(
    (o: { name: string }) => o.name === name
  );
  expect(created).toBeDefined();
  expect(created).not.toHaveProperty('adminEmail');

  await page.goto(`/organization/${created.id}`);
  await expect(page.getByText(name).first()).toBeVisible();
});
