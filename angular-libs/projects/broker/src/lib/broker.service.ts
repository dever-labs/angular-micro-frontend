import { Injectable, Signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { AppState, AppStateService } from './app-state.service';
import { ConfigRepositoryService } from './config/config-repository.service';

const APP_STATE_KEYS = new Set<string>(['theme', 'token', 'uri', 'users']);

@Injectable({
  providedIn: 'root',
})
export class BrokerService {
  constructor(
    private readonly appState: AppStateService,
    private readonly repository: ConfigRepositoryService,
  ) {}

  public set(key: string, value?: unknown): void {
    if (APP_STATE_KEYS.has(key)) {
      (this.appState[key as keyof AppState] as WritableSignal<unknown>).set(value);
    } else {
      this.repository.set(key, value as string);
    }
  }

  public get<T>(key: string): Signal<T | null> {
    if (APP_STATE_KEYS.has(key)) {
      return this.appState[key as keyof AppState] as unknown as Signal<T | null>;
    }
    return this.repository.getSignal(key) as Signal<T | null>;
  }

  public get$<T>(key: string): Observable<T> {
    return toObservable(this.get<T>(key)).pipe(
      filter((v): v is T => v != null),
      distinctUntilChanged(),
    );
  }
}
