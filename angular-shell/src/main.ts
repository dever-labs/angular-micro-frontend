import { initFederation } from '@angular-architects/native-federation';
import type { MenuItem } from '@czprz/broker';
import { environment } from './environments/environment';

async function bootstrap(): Promise<void> {
  const response = await fetch('/api/menu');
  const items: MenuItem[] = await response.json();

  // Merge platform infrastructure remotes (menu, toolbar — always deployed with the shell)
  // with feature remotes discovered dynamically from the menu service (CRD-driven).
  const manifest = {
    ...environment.infrastructureRemotes,
    ...Object.fromEntries(items.map(item => [item.remote, item.remoteEntry])),
  };

  // Stash for app.config.ts initializer so we don't fetch twice.
  (window as unknown as Record<string, unknown>)['__MENU_ITEMS__'] = items;

  await initFederation(manifest);
  await import('./bootstrap');
}

bootstrap().catch(err => console.error('[shell] Bootstrap failed:', err));
