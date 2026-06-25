# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checklist.spec.js >> adds a high priority test task
- Location: tests\checklist.spec.js:24:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('High')
Expected: visible
Error: strict mode violation: getByText('High') resolved to 3 elements:
    1) <option>High</option> aka getByLabel('Priority')
    2) <span class="priority high">High</span> aka getByText('High').nth(1)
    3) <span class="priority high">High</span> aka getByText('High').nth(2)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('High')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Release checklist" [ref=e4]:
    - paragraph [ref=e5]: SQA Practice App
    - heading "Release checklist" [level=1] [ref=e6]
    - generic "Task summary" [ref=e7]:
      - generic [ref=e8]: 3 total
      - generic [ref=e9]: 1 done
  - region "Checklist manager" [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e12]: Test task
      - generic [ref=e13]:
        - textbox "Test task" [ref=e14]:
          - /placeholder: Add a test case
        - combobox "Priority" [ref=e15]:
          - option "Low"
          - option "Medium" [selected]
          - option "High"
        - button "Add" [active] [ref=e16] [cursor=pointer]
    - generic "Task filters" [ref=e17]:
      - button "all" [pressed] [ref=e18] [cursor=pointer]
      - button "open" [ref=e19] [cursor=pointer]
      - button "done" [ref=e20] [cursor=pointer]
    - list "Tasks" [ref=e21]:
      - listitem [ref=e22]:
        - generic [ref=e23]:
          - checkbox "Validate payment error state" [ref=e24]
          - generic [ref=e25]: Validate payment error state
        - generic [ref=e26]: High
        - button "Remove" [ref=e27] [cursor=pointer]
      - listitem [ref=e28]:
        - generic [ref=e29]:
          - checkbox "Verify login page" [ref=e30]
          - generic [ref=e31]: Verify login page
        - generic [ref=e32]: High
        - button "Remove" [ref=e33] [cursor=pointer]
      - listitem [ref=e34]:
        - generic [ref=e35]:
          - checkbox "Check checkout validation" [checked] [ref=e36]
          - generic [ref=e37]: Check checkout validation
        - generic [ref=e38]: Medium
        - button "Remove" [ref=e39] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.beforeEach(async ({ page }) => {
  4  |   await page.goto('/');
  5  |   await page.evaluate(() => window.localStorage.clear());
  6  |   await page.reload();
  7  | });
  8  | 
  9  | test('loads the checklist dashboard with seeded tasks', async ({ page }) => {
  10 |   await expect(page.getByRole('heading', { name: 'Release checklist' })).toBeVisible();
  11 |   await expect(page.getByTestId('total-count')).toHaveText('2 total');
  12 |   await expect(page.getByText('Verify login page')).toBeVisible();
  13 |   await expect(page.getByText('Check checkout validation')).toBeVisible();
  14 | });
  15 | 
  16 | test('shows validation when task name is too short', async ({ page }) => {
  17 |   await page.getByLabel('Test task').fill('UI');
  18 |   await page.getByRole('button', { name: 'Add' }).click();
  19 | 
  20 |   await expect(page.getByRole('alert')).toHaveText('Task name must be at least 3 characters.');
  21 |   await expect(page.getByTestId('total-count')).toHaveText('2 total');
  22 | });
  23 | 
  24 | test('adds a high priority test task', async ({ page }) => {
  25 |   await page.getByLabel('Test task').fill('Validate payment error state');
  26 |   await page.getByLabel('Priority').selectOption('High');
  27 |   await page.getByRole('button', { name: 'Add' }).click();
  28 | 
  29 |   await expect(page.getByText('Validate payment error state')).toBeVisible();
> 30 |   await expect(page.getByText('High')).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
  31 |   await expect(page.getByTestId('total-count')).toHaveText('3 total');
  32 | });
  33 | 
  34 | test('marks a task complete and filters completed tasks', async ({ page }) => {
  35 |   await page.getByLabel('Verify login page').check();
  36 |   await page.getByRole('button', { name: 'done' }).click();
  37 | 
  38 |   await expect(page.getByText('Verify login page')).toBeVisible();
  39 |   await expect(page.getByText('Check checkout validation')).toBeVisible();
  40 |   await expect(page.getByTestId('completed-count')).toHaveText('2 done');
  41 | });
  42 | 
  43 | test('removes a task from the list', async ({ page }) => {
  44 |   const task = page.locator('li').filter({ hasText: 'Verify login page' });
  45 | 
  46 |   await task.getByRole('button', { name: 'Remove' }).click();
  47 | 
  48 |   await expect(page.getByText('Verify login page')).toBeHidden();
  49 |   await expect(page.getByTestId('total-count')).toHaveText('1 total');
  50 | });
  51 | 
  52 | test('persists added tasks after reload', async ({ page }) => {
  53 |   await page.getByLabel('Test task').fill('Run smoke suite after deploy');
  54 |   await page.getByRole('button', { name: 'Add' }).click();
  55 |   await page.reload();
  56 | 
  57 |   await expect(page.getByText('Run smoke suite after deploy')).toBeVisible();
  58 |   await expect(page.getByTestId('total-count')).toHaveText('3 total');
  59 | });
  60 | 
```