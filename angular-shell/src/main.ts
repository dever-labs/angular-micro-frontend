import { initFederation } from '@angular-architects/native-federation';
import type { MenuItem } from '@czprz/broker';

async function bootstrap(): Promise<void> {
  const response = await fetch('/api/menu');
  const items: MenuItem[] = await response.json();

  // Build the NF manifest dynamically — the menu service is the single source of truth.
  // In production each remoteEntry URL comes from the MenuEntry CRD via the operator.
  const manifest = Object.fromEntries(items.map(item => [item.remote, item.remoteEntry]));

  // Stash for app.config.ts initializer so we don't fetch twice.
  (window as unknown as Record<string, unknown>)['__MENU_ITEMS__'] = items;

  await initFederation(manifest);
  await import('./bootstrap');
}

bootstrap().catch(err => console.error('[shell] Bootstrap failed:', err));
