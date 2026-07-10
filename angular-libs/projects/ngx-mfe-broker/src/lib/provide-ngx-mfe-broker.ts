import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NGX_MFE_INITIAL_STATE } from './mfe-state.service';

export interface NgxMfeBrokerConfig {
  /**
   * Initial state values with their default values.
   * Each key becomes a Signal backed by localStorage with cross-tab sync.
   *
   * @example
   * provideNgxMfeBroker({
   *   initialState: { theme: 'light', token: null, users: [] }
   * })
   */
  initialState: Record<string, unknown>;
}

/**
 * Call in your `app.config.ts` to configure `@dever-labs/ngx-mfe-broker`.
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideNgxMfeBroker({ initialState: { theme: 'light', token: null } }),
 *   ]
 * };
 */
export function provideNgxMfeBroker(config: NgxMfeBrokerConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGX_MFE_INITIAL_STATE, useValue: config.initialState },
  ]);
}
