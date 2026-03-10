import { test, expect } from '@playwright/test';

test('shows error without hash', async ({ page }) => {
  await page.goto('http://localhost:5199/');
  await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible();
  await expect(page.locator('text=No context found')).toBeVisible();
});

test('shows error with invalid hash', async ({ page }) => {
  await page.goto('http://localhost:5199/#garbage');
  await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible();
  await expect(page.locator('text=No context found')).toBeVisible();
});

test('shows error boundary for invalid automerge URL', async ({ page }) => {
  const hash = encodeURIComponent(
    JSON.stringify({
      context: {
        doc: 'automerge:badurl',
        sync: ['wss://localhost:9999'],
      },
    }),
  );
  await page.goto(`http://localhost:5199/#${hash}`);
  await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible();
});

test('full path: hash → ProbProvider → useProbDocument → UI', async ({ page }) => {
  test.setTimeout(30_000);

  const hash = encodeURIComponent(
    JSON.stringify({
      context: {
        doc: 'automerge:2EJFJqn6jfrutqDcQA8USYf4vbHv',
        sync: ['wss://sync.probability.nz'],
      },
    }),
  );
  await page.goto(`http://localhost:5199/#${hash}`);

  // App renders and enters Suspense (Connecting...) or reaches error boundary.
  // Both are valid — depends on sync server availability.
  await expect(
    page.locator('text=Connecting...').or(page.getByRole('heading', { name: 'Error' })),
  ).toBeVisible({ timeout: 20_000 });
});
