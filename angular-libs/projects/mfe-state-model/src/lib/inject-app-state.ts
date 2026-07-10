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
  menu: 'menu',
  searchOpen: 'searchOpen',
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
  menu: [],
  searchOpen: 0,
};

/**
 * Typed accessor for the shared MFE state.
 * Call in any injection context (constructor, field initialiser, inject()).
 *
 * @example
 * readonly state = injectAppState();
 * // template:  {{ state.theme() }}
 * // code:      state.theme.set('dark-theme');
 * //            state.menu()          → MenuItem[]
 * //            state.menu.set([...]) → update menu for all MFEs
 */
export function injectAppState() {
  const mfe = inject(MfeStateService);
  return {
    theme: mfe.get<AppState['theme']>(APP_STATE_KEYS.theme),
    token: mfe.get<AppState['token']>(APP_STATE_KEYS.token),
    uri: mfe.get<AppState['uri']>(APP_STATE_KEYS.uri),
    users: mfe.get<AppState['users']>(APP_STATE_KEYS.users),
    menu: mfe.get<AppState['menu']>(APP_STATE_KEYS.menu),
    searchOpen: mfe.get<AppState['searchOpen']>(APP_STATE_KEYS.searchOpen),
    openSearch: () => {
      const s = mfe.get<number>(APP_STATE_KEYS.searchOpen);
      s.set((s() % 100) + 1);
    },
  };
}
