import { Injectable, signal } from '@angular/core';

/**
 * Generic in-memory registry of menu items, backed by an Angular Signal.
 *
 * T is the consumer's own menu item type — define it in your state contract
 * package and provide it when injecting this service.
 *
 * The shell loads the full menu via `load()`, and individual MFEs can
 * register or unregister their own items dynamically.
 */
@Injectable({ providedIn: 'root' })
export class MenuRegistryService<T extends { path: string }> {
  private readonly _items = signal<T[]>([]);

  /** Read-only signal consumed by menu UI and shell router sync. */
  readonly items = this._items.asReadonly();

  /** Replace the full menu list (e.g. initial load from API). */
  load(items: T[]): void {
    this._items.set(items);
  }

  /** Add or update a single item matched by `path`. */
  register(item: T): void {
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
