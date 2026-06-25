import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('loads the checklist dashboard with seeded tasks', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Release checklist' })).toBeVisible();
  await expect(page.getByTestId('total-count')).toHaveText('2 total');
  await expect(page.getByText('Verify login page')).toBeVisible();
  await expect(page.getByText('Check checkout validation')).toBeVisible();
});

test('shows validation when task name is too short', async ({ page }) => {
  await page.getByLabel('Test task').fill('UI');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByRole('alert')).toHaveText('Task name must be at least 3 characters.');
  await expect(page.getByTestId('total-count')).toHaveText('2 total');
});

test('adds a high priority test task', async ({ page }) => {
  await page.getByLabel('Test task').fill('Validate payment error state');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByText('Validate payment error state')).toBeVisible();
  await expect(page.getByText('High')).toBeVisible();
  await expect(page.getByTestId('total-count')).toHaveText('3 total');
});

test('marks a task complete and filters completed tasks', async ({ page }) => {
  await page.getByLabel('Verify login page').check();
  await page.getByRole('button', { name: 'done' }).click();

  await expect(page.getByText('Verify login page')).toBeVisible();
  await expect(page.getByText('Check checkout validation')).toBeVisible();
  await expect(page.getByTestId('completed-count')).toHaveText('2 done');
});

test('removes a task from the list', async ({ page }) => {
  const task = page.locator('li').filter({ hasText: 'Verify login page' });

  await task.getByRole('button', { name: 'Remove' }).click();

  await expect(page.getByText('Verify login page')).toBeHidden();
  await expect(page.getByTestId('total-count')).toHaveText('1 total');
});

test('persists added tasks after reload', async ({ page }) => {
  await page.getByLabel('Test task').fill('Run smoke suite after deploy');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.reload();

  await expect(page.getByText('Run smoke suite after deploy')).toBeVisible();
  await expect(page.getByTestId('total-count')).toHaveText('3 total');
});
