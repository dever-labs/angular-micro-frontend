import { Injectable, signal } from '@angular/core';
import { MenuItem } from './menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuRegistryService {
  private readonly _items = signal<MenuItem[]>([]);

  /** Read-only signal consumed by the menu remote and any other MFE. */
  readonly items = this._items.asReadonly();

  /** Called by the shell's APP_INITIALIZER after fetching the menu API. */
  load(items: MenuItem[]): void {
    this._items.set(items);
  }
}
