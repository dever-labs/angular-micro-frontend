import { test, expect } from '@playwright/test';
import { mockMenuApi, mockMenuApiFailure } from './helpers';

test.describe('Shell bootstrap', () => {
  test('renders the shell layout with empty menu', async ({ page }) => {
    await mockMenuApi(page, []);
    await page.goto('/');
    await expect(page.locator('app-root')).toBeAttached();
    await expect(page.locator('app-toolbar')).toBeAttached();
    await expect(page.locator('app-footer')).toBeAttached();
  });

  test('shows welcome page at root when no route matches', async ({ page }) => {
    await mockMenuApi(page, []);
    await page.goto('/');
    await expect(page.locator('app-welcome')).toBeVisible();
  });

  test('shows welcome page for unknown route with empty menu', async ({ page }) => {
    await mockMenuApi(page, []);
    await page.goto('/does-not-exist');
    await expect(page.locator('app-welcome')).toBeVisible();
  });

  test('stays functional when menu API returns 500', async ({ page }) => {
    await mockMenuApiFailure(page);
    await page.goto('/');
    // Shell must still render — graceful degradation
    await expect(page.locator('app-root')).toBeAttached();
    await expect(page.locator('app-welcome')).toBeVisible();
    // No uncaught errors should crash the page
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('[shell] Failed'))).toHaveLength(0);
  });
});
