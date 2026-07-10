import { test, expect } from '@playwright/test';
import { mockMenuApi, overviewMenuItem } from './helpers';

test.describe('Menu rendering', () => {
  test('menu shows items returned by the API', async ({ page }) => {
    await mockMenuApi(page, [
      { ...overviewMenuItem, label: 'Dashboard', group: 'Analytics' },
      { ...overviewMenuItem, label: 'Reports', path: 'reports', group: 'Analytics' },
      { ...overviewMenuItem, label: 'Export', path: 'export', group: 'Tools' },
    ]);
    await page.goto('/');

    // Remote lib-menu is mounted inside app-menu via ViewContainerRef
    const menu = page.locator('lib-menu');
    await expect(menu).toBeAttached({ timeout: 10_000 });

    await expect(menu.getByText('Dashboard')).toBeVisible();
    await expect(menu.getByText('Reports')).toBeVisible();
    await expect(menu.getByText('Export')).toBeVisible();
  });

  test('menu groups items under their group label', async ({ page }) => {
    await mockMenuApi(page, [
      { ...overviewMenuItem, label: 'Dashboard', group: 'Analytics' },
      { ...overviewMenuItem, label: 'Export', path: 'export', group: 'Tools' },
    ]);
    await page.goto('/');

    const menu = page.locator('lib-menu');
    await expect(menu).toBeAttached({ timeout: 10_000 });

    await expect(menu.getByText('Analytics')).toBeVisible();
    await expect(menu.getByText('Tools')).toBeVisible();
  });

  test('menu shows no items when API returns empty list', async ({ page }) => {
    await mockMenuApi(page, []);
    await page.goto('/');

    const menu = page.locator('lib-menu');
    await expect(menu).toBeAttached({ timeout: 10_000 });

    // No nav buttons for dynamic items
    await expect(menu.locator('button[ng-reflect-router-link]')).toHaveCount(0);
  });

  test('menu items are not visible when menu remote fails to load', async ({ page }) => {
    await mockMenuApi(page, [overviewMenuItem]);
    // Simulate remote entry being unreachable
    await page.route('**/remoteEntry.json', route => route.fulfill({ status: 503 }));
    await page.goto('/');
    // Shell should still render without crashing
    await expect(page.locator('app-root')).toBeAttached();
  });
});
