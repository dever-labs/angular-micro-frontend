import { Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { ConfigRepositoryService } from './config/config-repository.service';

@Injectable({
  providedIn: 'root',
})
export class BrokerService {
  constructor(private readonly repository: ConfigRepositoryService) {}

  public set(key: string, value?: unknown): void {
    this.repository.set(key, value as string);
  }

  public get<T>(key: string): Signal<T | null> {
    return this.repository.getSignal(key) as Signal<T | null>;
  }

  public get$<T>(key: string): Observable<T> {
    return toObservable(this.repository.getSignal(key)).pipe(
      filter((v): v is string => v != null),
      distinctUntilChanged(),
    ) as Observable<T>;
  }
}
