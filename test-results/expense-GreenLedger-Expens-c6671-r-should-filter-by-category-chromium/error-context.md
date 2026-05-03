# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: expense.spec.ts >> GreenLedger Expense Tracker >> should filter by category
- Location: tests/expense.spec.ts:42:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/login
Call log:
  - navigating to "http://localhost:4200/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('GreenLedger Expense Tracker', () => {
  4  |   
  5  |   test.beforeEach(async ({ page }) => {
> 6  |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/login
  7  |   });
  8  | 
  9  |   test('should login successfully', async ({ page }) => {
  10 |     await page.fill('input[type="email"]', 'test@example.com');
  11 |     await page.fill('input[type="password"]', 'password123');
  12 |     await page.click('button[type="submit"]');
  13 |     
  14 |     await expect(page).toHaveURL('/dashboard');
  15 |     await expect(page.locator('text=🌿 GreenLedger')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('should add a new expense', async ({ page }) => {
  19 |     // Assume we are already logged in for these tests
  20 |     await page.goto('/expenses');
  21 |     
  22 |     await page.click('[data-test-id="add-expense-btn"]');
  23 |     await page.fill('input[formControlName="amount"]', '100');
  24 |     await page.selectOption('mat-select[formControlName="category"]', 'Food');
  25 |     await page.fill('textarea[formControlName="description"]', 'Test Dinner');
  26 |     await page.click('button:has-text("Save")');
  27 |     
  28 |     await expect(page.locator('[data-test-id="expense-table"]')).toContainText('Test Dinner');
  29 |   });
  30 | 
  31 |   test('should search for an expense', async ({ page }) => {
  32 |     await page.goto('/expenses');
  33 |     const searchInput = page.locator('[data-test-id="search-input"]');
  34 |     await searchInput.fill('Coffee');
  35 |     
  36 |     // Check if table only shows Coffee
  37 |     const table = page.locator('[data-test-id="expense-table"]');
  38 |     await expect(table).toContainText('Coffee');
  39 |     await expect(table).not.toContainText('Dinner');
  40 |   });
  41 | 
  42 |   test('should filter by category', async ({ page }) => {
  43 |     await page.goto('/expenses');
  44 |     await page.click('[data-test-id="category-filter"]');
  45 |     await page.click('mat-option:has-text("Travel")');
  46 |     
  47 |     const table = page.locator('[data-test-id="expense-table"]');
  48 |     await expect(table).toContainText('Travel');
  49 |   });
  50 | 
  51 |   test('should edit an expense', async ({ page }) => {
  52 |     await page.goto('/expenses');
  53 |     await page.click('[data-test-id="edit-btn"] >> nth=0');
  54 |     await page.fill('input[formControlName="amount"]', '150');
  55 |     await page.click('button:has-text("Update")');
  56 |     
  57 |     await expect(page.locator('[data-test-id="expense-table"]')).toContainText('$150.00');
  58 |   });
  59 | 
  60 |   test('admin should see delete button', async ({ page }) => {
  61 |     // This would require mocking an admin user
  62 |     await page.goto('/expenses');
  63 |     await expect(page.locator('[data-test-id="delete-btn"]')).toBeVisible();
  64 |   });
  65 | 
  66 |   test('member should not see delete button', async ({ page }) => {
  67 |     // This would require mocking a member user
  68 |     await page.goto('/expenses');
  69 |     await expect(page.locator('[data-test-id="delete-btn"]')).not.toBeVisible();
  70 |   });
  71 | });
  72 | 
```