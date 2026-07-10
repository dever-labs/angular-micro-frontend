# angular-libs

Shared Angular library workspace for the micro-frontend platform.

## Libraries

### `@app/mfe-state-model`

The typed state contract for this application. Defines the `AppState` interface, typed keys, and the `injectAppState()` helper that all MFEs use to access shared state provided by [`@dever-labs/ngx-mfe-broker`](https://www.npmjs.com/package/@dever-labs/ngx-mfe-broker).

See [`projects/mfe-state-model/README.md`](projects/mfe-state-model/README.md) for full documentation.

## Building

From the repo root:

```bash
npm run build:libs
```

This outputs to `dist/mfe-state-model/` which is referenced by all workspace apps via `file:../angular-libs/dist/mfe-state-model`.
