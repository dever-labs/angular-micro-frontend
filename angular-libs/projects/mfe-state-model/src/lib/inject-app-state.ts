import { inject } from '@angular/core';
import { MfeStateService } from '@dever-labs/ngx-mfe-broker';
import { AppState } from './app-state.model';

/**
 * Typed key constants derived directly from AppState.
 * Adding or renaming a field in AppState surfaces here as a compile error.
 */
export const APP_STATE_KEYS: { [K in keyof AppState]: K } = {
  theme: 'theme',
  token: 'token',
  uri: 'uri',
  users: 'users',
} as const;

/**
 * Default values for the initial state.
 * Pass this to provideNgxMfeBroker() in the shell's app.config.ts.
 * Remote MFEs do NOT call provideNgxMfeBroker — the shell singleton is reused.
 */
export const APP_INITIAL_STATE: AppState = {
  theme: 'light-theme',
  token: null,
  uri: null,
  users: [],
};

/**
 * Typed accessor for the shared MFE state.
 * Call in any injection context (constructor, field initialiser, inject()).
 *
 * Returns a strongly-typed object of WritableSignals matching AppState.
 * Adding a field to AppState will surface as a missing property here.
 *
 * @example
 * readonly state = injectAppState();
 * // template:  {{ state.theme() }}
 * // code:      state.theme.set('dark-theme');
 */
export function injectAppState() {
  const mfe = inject(MfeStateService);
  return {
    theme: mfe.get<AppState['theme']>(APP_STATE_KEYS.theme),
    token: mfe.get<AppState['token']>(APP_STATE_KEYS.token),
    uri: mfe.get<AppState['uri']>(APP_STATE_KEYS.uri),
    users: mfe.get<AppState['users']>(APP_STATE_KEYS.users),
    searchOpen: mfe.searchOpen,
    openSearch: () => mfe.openSearch(),
  };
}
