import { Injectable, signal } from '@angular/core';
import { MenuItem } from './menu-item.model';

/**
 * In-memory registry of micro-frontend menu items, backed by an Angular Signal.
 *
 * The shell loads the full menu via `load()`, and individual MFEs can
 * register or unregister their own items dynamically.
 */
@Injectable({ providedIn: 'root' })
export class MenuRegistryService {
  private readonly _items = signal<MenuItem[]>([]);

  /** Read-only signal consumed by menu UI and shell router sync. */
  readonly items = this._items.asReadonly();

  /** Replace the full menu list (e.g. initial load from API). */
  load(items: MenuItem[]): void {
    this._items.set(items);
  }

  /** Add or update a single item matched by `path`. */
  register(item: MenuItem): void {
    this._items.update(current => {
      const without = current.filter(i => i.path !== item.path);
      return [...without, item];
    });
  }

  /** Remove a registered item by its path. */
  unregister(path: string): void {
    this._items.update(current => current.filter(i => i.path !== path));
  }
}
