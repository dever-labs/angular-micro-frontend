import { Injectable, signal, Signal, WritableSignal, OnDestroy } from '@angular/core';

const CHANNEL_NAME = '@dever-labs/ngx-mfe-broker:config';

type ConfigMessage =
  | { type: 'set'; key: string; value: string }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

/**
 * Generic cross-tab string key-value store backed by localStorage.
 * Changes are broadcast to all other tabs/windows via BroadcastChannel.
 */
@Injectable({ providedIn: 'root' })
export class ConfigRepositoryService implements OnDestroy {
  private readonly signals = new Map<string, WritableSignal<string | null>>();

  private readonly channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  private readonly inboundKeys = new Set<string>();

  constructor() {
    this.channel?.addEventListener('message', ({ data }: MessageEvent<ConfigMessage>) => {
      if (data.type === 'clear') {
        this.signals.forEach((s, k) => { this.inboundKeys.add(k); s.set(null); });
        queueMicrotask(() => this.inboundKeys.clear());
      } else if (data.type === 'remove') {
        this.inboundKeys.add(data.key);
        this.signals.get(data.key)?.set(null);
        queueMicrotask(() => this.inboundKeys.delete(data.key));
      } else {
        this.inboundKeys.add(data.key);
        this.getWritable(data.key).set(data.value);
        queueMicrotask(() => this.inboundKeys.delete(data.key));
      }
    });
  }

  getSignal(key: string): Signal<string | null> {
    return this.getWritable(key).asReadonly();
  }

  get(key: string): string | null {
    return this.getSignal(key)();
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
    this.getWritable(key).set(value);
    if (!this.inboundKeys.has(key)) {
      this.channel?.postMessage({ type: 'set', key, value } satisfies ConfigMessage);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    this.signals.get(key)?.set(null);
    if (!this.inboundKeys.has(key)) {
      this.channel?.postMessage({ type: 'remove', key } satisfies ConfigMessage);
    }
  }

  clear(): void {
    localStorage.clear();
    this.signals.forEach(s => s.set(null));
    this.channel?.postMessage({ type: 'clear' } satisfies ConfigMessage);
  }

  ngOnDestroy(): void {
    this.channel?.close();
  }

  private getWritable(key: string): WritableSignal<string | null> {
    if (!this.signals.has(key)) {
      this.signals.set(key, signal(localStorage.getItem(key)));
    }
    return this.signals.get(key)!;
  }
}
