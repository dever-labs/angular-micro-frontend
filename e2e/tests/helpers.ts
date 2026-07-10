import { Page } from '@playwright/test';

export interface MenuItemFixture {
  label: string;
  path: string;
  icon?: string;
  group?: string;
  remote: string;
  exposedModule: string;
  routesExport?: string;
}

/** Intercept /api/menu with a fixed list of items. */
export async function mockMenuApi(page: Page, items: MenuItemFixture[]): Promise<void> {
  await page.route('**/api/menu', route => route.fulfill({ json: items }));
}

/** Intercept /api/menu to simulate a server error. */
export async function mockMenuApiFailure(page: Page): Promise<void> {
  await page.route('**/api/menu', route => route.fulfill({ status: 500, body: 'Internal Server Error' }));
}

/** Default overview menu item matching the actual remote setup. */
export const overviewMenuItem: MenuItemFixture = {
  label: 'Dashboard',
  path: 'dashboard',
  icon: 'pi pi-chart-bar',
  group: 'Analytics',
  remote: 'overview',
  exposedModule: './routes',
};
