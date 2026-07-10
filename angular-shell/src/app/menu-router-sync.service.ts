import { effect, inject, Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { injectAppState, MenuItem } from '@app/mfe-state-model';
import { STATIC_ROUTES } from './static-routes.token';

@Injectable({ providedIn: 'root' })
export class MenuRouterSyncService {
  constructor() {
    const router = inject(Router);
    const state = injectAppState();
    const staticRoutes = inject(STATIC_ROUTES);

    effect(() => {
      router.resetConfig([...this.buildRoutes(state.menu()), ...staticRoutes]);
    });
  }

  private buildRoutes(items: MenuItem[]): Routes {
    return items.map(item => ({
      path: item.path,
      loadChildren: () =>
        loadRemoteModule(item.remote, item.exposedModule)
          .then(m => m[item.routesExport ?? 'APP_ROUTES']),
    }));
  }
}
