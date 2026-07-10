import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { MenuItem, MenuRegistryService } from '@czprz/broker';
import { routes } from './app.routes';

function buildRoutes(items: MenuItem[]): Routes {
  return items.map(item => ({
    path: item.path,
    loadChildren: () =>
      loadRemoteModule(item.remote, item.exposedModule).then(m => m.APP_ROUTES),
  }));
}

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
    provideAppInitializer(async () => {
      const http = inject(HttpClient);
      const router = inject(Router);
      const menuRegistry = inject(MenuRegistryService);

      try {
        const items = await firstValueFrom(http.get<MenuItem[]>('/api/menu'));
        menuRegistry.load(items);
        router.resetConfig([...buildRoutes(items), ...routes]);
      } catch (err) {
        console.error('[shell] Failed to load menu configuration:', err);
      }
    }),
  ],
};
