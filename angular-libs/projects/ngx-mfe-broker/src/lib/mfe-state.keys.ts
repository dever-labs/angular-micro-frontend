import { inject } from '@angular/core';
import { MfeStateService } from './mfe-state.service';

/**
 * Typed key constants for the MFE shared state in this application.
 * Use these instead of raw strings to avoid typos across micro-frontends.
 */
export const MFE_STATE_KEYS = {
  THEME: 'theme',
  TOKEN: 'token',
  URI: 'uri',
  USERS: 'users',
} as const;

/**
 * Initial state defaults — provided once by the shell via provideNgxMfeBroker.
 * Remote MFEs do NOT call provideNgxMfeBroker; the shell singleton is reused.
 */
export const MFE_INITIAL_STATE = {
  [MFE_STATE_KEYS.THEME]: 'light-theme' as string,
  [MFE_STATE_KEYS.TOKEN]: null as string | null,
  [MFE_STATE_KEYS.URI]: null as string | null,
  [MFE_STATE_KEYS.USERS]: [] as string[],
};

/**
 * Typed MFE state accessor.
 * Call inside an injection context (constructor, field initialiser, inject()).
 *
 * @example
 * readonly state = injectMfeState();
 * // template: {{ state.theme() }}
 * // code:     state.theme.set('dark-theme');
 */
export function injectMfeState() {
  const mfe = inject(MfeStateService);
  return {
    theme: mfe.get<string>(MFE_STATE_KEYS.THEME),
    token: mfe.get<string | null>(MFE_STATE_KEYS.TOKEN),
    uri: mfe.get<string | null>(MFE_STATE_KEYS.URI),
    users: mfe.get<string[]>(MFE_STATE_KEYS.USERS),
    searchOpen: mfe.searchOpen,
    openSearch: () => mfe.openSearch(),
  };
}
