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
  return token as string;
}

test('certificate: create -> private link -> print page -> revoke', async ({
  page,
  browser,
}) => {
  const stamp = Date.now();
  const organizationName = `E2E Theater ${stamp}`;
  const achievement = `Ensemble ${stamp}`;

  // An organisation without its own admin: grow issues its certificates.
  const token = await loginAsSuperAdmin(page);
  const created = await page.request.post('/api/organizations', {
    data: { name: organizationName, published: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(created.status()).toBe(201);

  // 1. Fill in the form; the preview shows the texts as they are typed.
  await page.goto('/dashboard/new-certificate');
  await page
    .getByLabel('Ausgestellt von')
    .selectOption({ label: organizationName });
  await page.getByLabel('Farbe').selectOption('burgundy');
  await page
    .getByLabel('Einleitungstext')
    .fill('Für die Mitwirkung an der Spielzeit verleihen wir das');
  await page.locator('input[name="achievement"]').fill(achievement);
  await page.getByLabel('Name 1', { exact: true }).fill('Petra Klang');
  await page.getByLabel('Funktion 1').fill('Intendanz');
  await page.getByLabel('Empfängername 1').fill('Kim Bühne');
  await page.getByLabel('Empfänger-E-Mail 1').fill('kim@example.com');

  const preview = page.locator('.certificate-design');
  await expect(preview.getByText(achievement)).toBeVisible();
  await expect(preview.getByText('Kim Bühne')).toBeVisible();
  await expect(preview.getByText('Zertifikat für')).toBeVisible();

  const saved = page.waitForResponse(
    (r) =>
      r.url().endsWith('/api/certificates') && r.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Speichern' }).click();
  expect((await saved).status()).toBe(201);

  // 2. Listed; without SMTP, "Senden" says to pass the links on and opens them.
  await expect(page).toHaveURL(/\/dashboard\/certificates$/);
  const row = page.getByRole('row').filter({ hasText: achievement });
  await expect(row).toBeVisible();
  await row
    .getByRole('button', { name: `„${achievement}“ per E-Mail senden` })
    .click();
  await expect(
    page.getByText('E-Mail ist noch nicht eingerichtet')
  ).toBeVisible();
  const linkField = page.getByLabel('Link für Kim Bühne');
  await expect(linkField).toBeVisible();
  const link = await linkField.inputValue();
  expect(link).toMatch(/\/certificates\/[A-Za-z0-9_-]{32}$/);

  // 3. The recipient opens the link without logging in.
  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(link);
  await expect(guestPage.getByText('Kim Bühne')).toBeVisible();
  await expect(guestPage.getByText(organizationName)).toBeVisible();
  await expect(
    guestPage.getByRole('button', { name: 'Drucken oder als PDF speichern' })
  ).toBeVisible();
  await expect(guestPage.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/
  );

  // 4. Turning the link off takes effect at once.
  page.once('dialog', (dialog) => dialog.accept());
  const revoked = page.waitForResponse((r) => r.url().includes('/recipients/'));
  await page.getByRole('button', { name: 'Deaktivieren' }).click();
  expect((await revoked).status()).toBe(200);
  await expect(page.getByText('Link deaktiviert')).toBeVisible();

  await guestPage.reload();
  await expect(
    guestPage.getByText(
      'Zertifikat nicht verfügbar / Certificate not available'
    )
  ).toBeVisible();
  await expect(guestPage.getByText('Kim Bühne')).toHaveCount(0);

  // A made-up code finds nothing.
  const unknown = await guestPage.goto(`/certificates/${'x'.repeat(32)}`);
  expect(unknown?.status()).toBe(404);

  // 5. The certificates API needs a dashboard login.
  const anonymous = await guestPage.request.get('/api/certificates');
  expect(anonymous.status()).toBe(401);
  await guest.close();
});
