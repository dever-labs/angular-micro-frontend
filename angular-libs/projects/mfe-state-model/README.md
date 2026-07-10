# @app/mfe-state-model

> Shared state contract for this application's micro-frontends.

This package defines **what** state is shared across micro-frontends — its shape,
its keys, and how to access it. It does not implement storage or distribution;
that is handled by [`@dever-labs/ngx-mfe-broker`](https://github.com/dever-labs/ngx-mfe-broker).

## The State Contract Pattern

The broker is intentionally generic. It doesn't know what your app's state looks
like. This package fills that gap for **your** application.

```
@dever-labs/ngx-mfe-broker   — generic: Signals + BroadcastChannel + localStorage
@app/mfe-state-model         — your contract: AppState, typed keys, injectAppState()
```

### In a monorepo
Keep this as a local library — all MFEs reference it via `file:` path.

### In a multi-repo setup
Publish this package to npm (under your own scope). Every MFE repo declares it
as a dependency and gets the same typed contract.

## What's inside

### `AppState`
The interface that defines the shape of all shared state:

```typescript
export interface AppState extends Record<string, unknown> {
  theme: string;
  token: string | null;
  uri: string | null;
  users: string[];
}
```

Extend this when you add new shared state. The change is automatically reflected
in `APP_STATE_KEYS`, `APP_INITIAL_STATE`, and `injectAppState()`.

### `APP_STATE_KEYS`
Type-safe key constants derived from `AppState`. Prevents magic strings:

```typescript
// Instead of mfe.get<string>('theme') — a typo compiles silently.
// Use:
mfe.get<AppState['theme']>(APP_STATE_KEYS.theme)
```

### `APP_INITIAL_STATE`
Default values passed to `provideNgxMfeBroker()` in the shell. Only the shell
calls this — remote MFEs reuse the shell's singleton.

### `injectAppState()`
Typed accessor. Call in any injection context:

```typescript
readonly state = injectAppState();

// Fully typed:
this.state.theme()           // string
this.state.theme.set('dark') // WritableSignal<string>
this.state.token()           // string | null
this.state.users()           // string[]
this.state.openSearch()      // cross-tab command palette trigger
```

## Shell setup (once)

```typescript
// app.config.ts — shell only
import { provideNgxMfeBroker } from '@dever-labs/ngx-mfe-broker';
import { APP_INITIAL_STATE } from '@app/mfe-state-model';

provideNgxMfeBroker({ initialState: APP_INITIAL_STATE })
```

## MFE setup (any remote)

No setup required. Just inject:

```typescript
import { injectAppState } from '@app/mfe-state-model';

readonly state = injectAppState();
```
