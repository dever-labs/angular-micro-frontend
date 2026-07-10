import { effect, inject, Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { MenuRegistryService } from '@app/mfe-state-model';
import { MenuItem } from '@app/mfe-state-model';
import { STATIC_ROUTES } from './static-routes.token';

@Injectable({ providedIn: 'root' })
export class MenuRouterSyncService {
  constructor() {
    const router = inject(Router);
    const menuRegistry = inject(MenuRegistryService);
    const staticRoutes = inject(STATIC_ROUTES);

    effect(() => {
      const items = menuRegistry.items();
      router.resetConfig([...this.buildRoutes(items), ...staticRoutes]);
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
