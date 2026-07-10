import { test, expect } from '@playwright/test';
import { mockMenuApi, overviewMenuItem } from './helpers';

test.describe('Dynamic route navigation', () => {
  test('navigates to a dynamically registered route via URL', async ({ page }) => {
    await mockMenuApi(page, [overviewMenuItem]);
    await page.goto('/dashboard');
    // Overview remote should mount
    await expect(page.locator('lib-overview')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('navigates to dynamic route by clicking menu item', async ({ page }) => {
    await mockMenuApi(page, [overviewMenuItem]);
    await page.goto('/');

    const menu = page.locator('lib-menu');
    await expect(menu).toBeAttached({ timeout: 10_000 });

    await menu.getByText('Dashboard').click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('lib-overview')).toBeVisible({ timeout: 15_000 });
  });

  test('falls back to welcome page for a route not in API response', async ({ page }) => {
    await mockMenuApi(page, [overviewMenuItem]);
    await page.goto('/not-registered');
    await expect(page.locator('app-welcome')).toBeVisible();
  });

  test('routes from previous API load do not persist after page refresh with different menu', async ({ page }) => {
    // First load — dashboard is registered
    await mockMenuApi(page, [overviewMenuItem]);
    await page.goto('/dashboard');
    await expect(page.locator('lib-overview')).toBeVisible({ timeout: 15_000 });

    // Simulate a new page load where the API no longer returns dashboard
    await page.route('**/api/menu', route => route.fulfill({ json: [] }));
    await page.reload();

    // Dashboard route should no longer exist — falls back to welcome
    await page.goto('/dashboard');
    await expect(page.locator('app-welcome')).toBeVisible();
  });

  test('multiple dynamic routes all register and navigate correctly', async ({ page }) => {
    await mockMenuApi(page, [
      { ...overviewMenuItem, label: 'Dashboard', path: 'dashboard' },
      { ...overviewMenuItem, label: 'Analytics', path: 'analytics' },
    ]);
    await page.goto('/dashboard');
    await expect(page.locator('lib-overview')).toBeVisible({ timeout: 15_000 });

    await page.goto('/analytics');
    await expect(page.locator('lib-overview')).toBeVisible({ timeout: 15_000 });
  });
});
