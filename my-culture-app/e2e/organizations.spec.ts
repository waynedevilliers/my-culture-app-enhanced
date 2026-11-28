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
  await page.fill('input[name="street"]', 'Kulturstraße 12');
  await page.fill('input[name="postalCode"]', '10115');
  await page.fill('input[name="city"]', 'Berlin');
  // Without an own admin, grow manages the organisation.
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

test('organisation admin: apply with own admin -> approve -> set password -> sees only own organisation', async ({
  page,
  browser,
}) => {
  const stamp = Date.now();
  const name = `E2E Musikschule ${stamp}`;
  const adminEmail = `org-admin-${stamp}@example.com`;
  const password = 'Ein-langes-Passwort-1';

  // 1. Apply with an admin of its own.
  await page.goto('/join-us');
  await page.fill('input[name="organizationName"]', name);
  await page.selectOption('select[name="organizationType"]', { index: 1 });
  await page.fill(
    'textarea[name="description"]',
    'Musikunterricht für alle Altersgruppen.'
  );
  await page.fill('input[name="street"]', 'Notenweg 3');
  await page.fill('input[name="postalCode"]', '10115');
  await page.fill('input[name="city"]', 'Berlin');
  await expect(page.locator('input[name="adminName"]')).toHaveCount(0);
  await page.locator('input[name="hasOwnAdmin"]').check();
  await page.fill('input[name="adminName"]', 'Ora Admin');
  await page.fill('input[name="adminEmail"]', adminEmail);
  const applied = page.waitForResponse((r) =>
    r.url().endsWith('/api/organizations/apply')
  );
  await page.getByRole('button', { name: 'Antrag einreichen' }).click();
  expect((await applied).status()).toBe(201);

  // 2. Super admin approves; without SMTP the link is shown to pass on.
  await loginAsSuperAdmin(page);
  await page.goto('/dashboard/organization-applications');
  const row = page.getByRole('row').filter({ hasText: name });
  await row.getByTitle('Genehmigen').click();
  const linkField = page.getByLabel('Link zum Festlegen des Passworts');
  await expect(linkField).toBeVisible();
  const link = await linkField.inputValue();
  expect(link).toContain('/set-password?token=');

  // 3. The new admin sets a password (fresh browser, not logged in).
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto(link);
  await adminPage.fill('#new-password', password);
  await adminPage.fill('#confirm-password', password);
  const saved = adminPage.waitForResponse((r) =>
    r.url().endsWith('/api/auth/set-password')
  );
  await adminPage.getByRole('button', { name: 'Passwort speichern' }).click();
  expect((await saved).status()).toBe(200);

  // The link works only once.
  const reused = await adminPage.request.post('/api/auth/set-password', {
    data: { token: new URL(link).searchParams.get('token'), password },
  });
  expect(reused.status()).toBe(400);

  // 4. Log in as the organisation admin: only their organisation is listed.
  const login = await adminPage.request.post('/api/auth/login', {
    data: { email: adminEmail, password },
  });
  expect(login.status()).toBe(200);
  const { token } = (await login.json()).data;
  await adminPage.evaluate((t) => localStorage.setItem('token', t), token);
  await adminPage.goto('/dashboard/organizations');
  await expect(
    adminPage.getByRole('row').filter({ hasText: name })
  ).toBeVisible();
  await expect(adminPage.getByRole('row')).toHaveCount(2); // header + own organisation
  await expect(adminPage.getByRole('link', { name: 'Anträge' })).toHaveCount(0);

  // The API refuses super admin actions.
  const create = await adminPage.request.post('/api/organizations', {
    data: { name: 'Fremd' },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(create.status()).toBe(403);
  await adminContext.close();
});
