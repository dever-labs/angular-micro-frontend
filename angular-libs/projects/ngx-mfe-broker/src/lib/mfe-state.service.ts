import { effect, inject, Injectable, InjectionToken, OnDestroy, signal, WritableSignal } from '@angular/core';

const CHANNEL_NAME = '@dever-labs/ngx-mfe-broker:state';
const SEARCH_CHANNEL_NAME = '@dever-labs/ngx-mfe-broker:search';

/**
 * Injection token used to supply the initial state shape and default values.
 *
 * Provide this via `provideNgxMfeBroker({ initialState: { ... } })`.
 *
 * @example
 * provideNgxMfeBroker({ initialState: { theme: 'light', token: null } })
 */
export const NGX_MFE_INITIAL_STATE = new InjectionToken<Record<string, unknown>>(
  '@dever-labs/ngx-mfe-broker:initial-state',
  { factory: () => ({}) },
);

function serialize(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function deserialize(raw: string, fallback: unknown): unknown {
  if (typeof fallback === 'string') return raw;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function stateEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

type StateMessage = { key: string; value: unknown };

/**
 * Generic typed state service for micro-frontends.
 *
 * State is backed by localStorage, reactive via Angular Signals, and
 * synchronised across browser tabs via BroadcastChannel.
 *
 * Consumers define their own state shape by providing `NGX_MFE_INITIAL_STATE`.
 * Use `get<T>(key)` / `set(key, value)` for type-safe access.
 */
@Injectable({ providedIn: 'root' })
export class MfeStateService implements OnDestroy {
  private readonly signals = new Map<string, WritableSignal<unknown>>();
  private readonly defaults = new Map<string, unknown>();
  private readonly inboundKeys = new Set<string>();

  /** Fires whenever the command palette / search should open. Increment-based to re-trigger. */
  readonly searchOpen = signal(0);

  private readonly channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  private readonly searchChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(SEARCH_CHANNEL_NAME)
    : null;

  constructor() {
    const initialState = inject(NGX_MFE_INITIAL_STATE);

    for (const [key, defaultValue] of Object.entries(initialState)) {
      this.defaults.set(key, defaultValue);
      const raw = localStorage.getItem(key);
      const value = raw !== null ? deserialize(raw, defaultValue) : defaultValue;
      const s = signal(value);
      this.signals.set(key, s);

      effect(() => {
        const current = s();
        localStorage.setItem(key, serialize(current));
        if (!this.inboundKeys.has(key)) {
          this.channel?.postMessage({ key, value: current } satisfies StateMessage);
        }
      });
    }

    this.channel?.addEventListener('message', ({ data }: MessageEvent<StateMessage>) => {
      const s = this.signals.get(data.key);
      if (!s) return;
      if (stateEqual(s(), data.value)) return;
      this.inboundKeys.add(data.key);
      s.set(data.value as never);
      queueMicrotask(() => this.inboundKeys.delete(data.key));
    });

    this.searchChannel?.addEventListener('message', () => {
      this.searchOpen.update(n => n + 1);
    });
  }

  /** Get a readonly Signal for the given key. */
  get<T>(key: string): WritableSignal<T> {
    if (!this.signals.has(key)) {
      const raw = localStorage.getItem(key);
      this.signals.set(key, signal(raw !== null ? deserialize(raw, null) : null));
    }
    return this.signals.get(key) as WritableSignal<T>;
  }

  /** Set a value — persists to localStorage and broadcasts cross-tab. */
  set<T>(key: string, value: T): void {
    this.get<T>(key).set(value);
  }

  /** Request the command palette / search to open across all MFEs and tabs. */
  openSearch(): void {
    this.searchOpen.update(n => n + 1);
    this.searchChannel?.postMessage('open');
  }

  ngOnDestroy(): void {
    this.channel?.close();
    this.searchChannel?.close();
  }
}
