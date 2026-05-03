import { test, expect } from '@playwright/test';

test.describe('GreenLedger Expense Tracker', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=🌿 GreenLedger')).toBeVisible();
  });

  test('should add a new expense', async ({ page }) => {
    // Assume we are already logged in for these tests
    await page.goto('/expenses');
    
    await page.click('[data-test-id="add-expense-btn"]');
    await page.fill('input[formControlName="amount"]', '100');
    await page.selectOption('mat-select[formControlName="category"]', 'Food');
    await page.fill('textarea[formControlName="description"]', 'Test Dinner');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('[data-test-id="expense-table"]')).toContainText('Test Dinner');
  });

  test('should search for an expense', async ({ page }) => {
    await page.goto('/expenses');
    const searchInput = page.locator('[data-test-id="search-input"]');
    await searchInput.fill('Coffee');
    
    // Check if table only shows Coffee
    const table = page.locator('[data-test-id="expense-table"]');
    await expect(table).toContainText('Coffee');
    await expect(table).not.toContainText('Dinner');
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/expenses');
    await page.click('[data-test-id="category-filter"]');
    await page.click('mat-option:has-text("Travel")');
    
    const table = page.locator('[data-test-id="expense-table"]');
    await expect(table).toContainText('Travel');
  });

  test('should edit an expense', async ({ page }) => {
    await page.goto('/expenses');
    await page.click('[data-test-id="edit-btn"] >> nth=0');
    await page.fill('input[formControlName="amount"]', '150');
    await page.click('button:has-text("Update")');
    
    await expect(page.locator('[data-test-id="expense-table"]')).toContainText('$150.00');
  });

  test('admin should see delete button', async ({ page }) => {
    // This would require mocking an admin user
    await page.goto('/expenses');
    await expect(page.locator('[data-test-id="delete-btn"]')).toBeVisible();
  });

  test('member should not see delete button', async ({ page }) => {
    // This would require mocking a member user
    await page.goto('/expenses');
    await expect(page.locator('[data-test-id="delete-btn"]')).not.toBeVisible();
  });
});
