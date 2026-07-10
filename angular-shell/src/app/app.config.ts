import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { firstValueFrom } from 'rxjs';
import { MenuItem, MenuRegistryService } from '@czprz/broker';
import { routes } from './app.routes';
import { STATIC_ROUTES } from './static-routes.token';
import { MenuRouterSyncService } from './menu-router-sync.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-theme',
        },
      },
    }),
    // Provide static routes so MenuRouterSyncService can append them after dynamic ones.
    { provide: STATIC_ROUTES, useValue: routes },
    // Eagerly instantiate the sync service so its effect() starts immediately.
    provideAppInitializer(() => void inject(MenuRouterSyncService)),
    // Menu items were pre-fetched in main.ts before initFederation — reuse them.
    provideAppInitializer(async () => {
      const menuRegistry = inject(MenuRegistryService);
      const preloaded = (window as unknown as Record<string, unknown>)['__MENU_ITEMS__'] as MenuItem[] | undefined;
      if (preloaded) {
        menuRegistry.load(preloaded);
        return;
      }
      // Fallback: re-fetch (e.g. during unit tests where main.ts doesn't run).
      const http = inject(HttpClient);
      try {
        const items = await firstValueFrom(http.get<MenuItem[]>('/api/menu'));
        menuRegistry.load(items);
      } catch (err) {
        console.error('[shell] Failed to load menu configuration:', err);
      }
    }),
  ],
};
