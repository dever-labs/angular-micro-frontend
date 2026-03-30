import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigRepositoryService {
  private readonly signals = new Map<string, WritableSignal<string | null>>();

  getSignal(key: string): Signal<string | null> {
    if (!this.signals.has(key)) {
      this.signals.set(key, signal(localStorage.getItem(key)));
    }
    return this.signals.get(key)!.asReadonly();
  }

  get(key: string): string | null {
    return this.getSignal(key)();
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
    if (this.signals.has(key)) {
      this.signals.get(key)!.set(value);
    } else {
      this.signals.set(key, signal(value));
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    this.signals.get(key)?.set(null);
  }

  clear(): void {
    localStorage.clear();
    this.signals.forEach(s => s.set(null));
  }
}
