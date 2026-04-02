import { effect, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';

export interface AppState {
  theme: string;
  token: string | null;
  uri: string | null;
  users: string[];
}

const CHANNEL_NAME = '@czprz/broker:state';
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

@Injectable({ providedIn: 'root' })
export class AppStateService implements OnDestroy {
  readonly theme: WritableSignal<string> = signal(readFromStorage('theme'));
  readonly token: WritableSignal<string | null> = signal(readFromStorage('token'));
  readonly uri: WritableSignal<string | null> = signal(readFromStorage('uri'));
  readonly users: WritableSignal<string[]> = signal(readFromStorage('users'));

  private readonly channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  private broadcasting = false;

  constructor() {
    // Persist each signal to localStorage and broadcast to other tabs
    for (const key of STORAGE_KEYS) {
      effect(() => {
        const value = (this[key] as WritableSignal<AppState[typeof key]>)();
        writeToStorage(key, value);
        if (!this.broadcasting) {
          this.channel?.postMessage({ key, value });
        }
      });
    }

    // Receive cross-tab updates
    this.channel?.addEventListener('message', (event) => {
      const { key, value } = event.data as { key: keyof AppState; value: AppState[keyof AppState] };
      this.broadcasting = true;
      (this[key] as WritableSignal<AppState[keyof AppState]>).set(value as never);
      this.broadcasting = false;
    });
  }

  ngOnDestroy(): void {
    this.channel?.close();
  }
}
