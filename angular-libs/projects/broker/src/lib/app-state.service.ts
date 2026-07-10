import { effect, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';

export interface AppState {
  theme: string;
  token: string | null;
  uri: string | null;
  users: string[];
}

const CHANNEL_NAME = '@czprz/broker:state';
const SEARCH_CHANNEL_NAME = '@czprz/broker:search';
const STORAGE_KEYS: (keyof AppState)[] = ['theme', 'token', 'uri', 'users'];

function readFromStorage<K extends keyof AppState>(key: K): AppState[K] {
  const raw = localStorage.getItem(key);
  if (raw == null) {
    if (key === 'theme') return 'light-theme' as AppState[K];
    if (key === 'users') return [] as unknown as AppState[K];
    return null as AppState[K];
  }
  if (key === 'users') {
    try { return JSON.parse(raw) as AppState[K]; } catch { return [] as unknown as AppState[K]; }
  }
  return raw as AppState[K];
}

function writeToStorage<K extends keyof AppState>(key: K, value: AppState[K]): void {
  if (value == null) {
    localStorage.removeItem(key);
  } else if (key === 'users') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value as string);
  }
}

function stateEqual<K extends keyof AppState>(key: K, a: AppState[K], b: AppState[K]): boolean {
  if (key === 'users') return JSON.stringify(a) === JSON.stringify(b);
  return a === b;
}

@Injectable({ providedIn: 'root' })
export class AppStateService implements OnDestroy {
  readonly theme = signal(readFromStorage('theme'));
  readonly token = signal(readFromStorage('token'));
  readonly uri   = signal(readFromStorage('uri'));
  readonly users = signal(readFromStorage('users'));

  /** Fires whenever any component wants to open the command palette. */
  readonly searchOpen = signal(0);

  private readonly channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  private readonly searchChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(SEARCH_CHANNEL_NAME)
    : null;

  /** Keys currently being updated from a cross-tab message — skip re-broadcast. */
  private readonly inboundKeys = new Set<keyof AppState>();

  constructor() {
    // Persist each signal to localStorage and broadcast to other tabs.
    // Skip broadcast when the update itself came from a cross-tab message.
    for (const key of STORAGE_KEYS) {
      effect(() => {
        const value = (this[key] as WritableSignal<AppState[keyof AppState]>)();
        writeToStorage(key, value);
        if (!this.inboundKeys.has(key)) {
          this.channel?.postMessage({ key, value });
        }
      });
    }

    // Receive cross-tab updates. Only call .set() when the value actually
    // differs (JSON comparison for arrays) to prevent infinite loops caused
    // by BroadcastChannel always delivering a new object reference.
    this.channel?.addEventListener('message', (event) => {
      const { key, value } = event.data as { key: keyof AppState; value: AppState[keyof AppState] };
      const signal = this[key] as WritableSignal<AppState[keyof AppState]>;
      if (stateEqual(key, signal(), value)) return;
      this.inboundKeys.add(key);
      signal.set(value as never);
      // Use microtask so the effect has time to flush before we clear the guard
      queueMicrotask(() => this.inboundKeys.delete(key));
    });

    // Receive search-open requests from other micro-frontends
    this.searchChannel?.addEventListener('message', () => {
      this.searchOpen.update(n => n + 1);
    });
  }

  /** Request the command palette to open (works across MFE boundaries). */
  openSearch(): void {
    this.searchOpen.update(n => n + 1);
    this.searchChannel?.postMessage('open');
  }

  ngOnDestroy(): void {
    this.channel?.close();
    this.searchChannel?.close();
  }
}
