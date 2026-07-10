# Angular Micro-Frontend Reference

A **production-grade reference implementation** of an Angular micro-frontend architecture using [Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation). Every remote is a fully independent Angular application that is composed at runtime by a shell — no monorepo build step required.

The repo demonstrates what a real MFE platform looks like end-to-end: dynamic menus driven by a REST API, signal-based shared state, a global command palette, dark mode with PrimeNG tokens, and a deployment story that scales from a single `docker-compose up` to a Kubernetes cluster with Gateway API HTTPRoutes and custom CRDs.

---

## Table of Contents

- [What this demonstrates](#what-this-demonstrates)
- [Architecture overview](#architecture-overview)
- [Project structure](#project-structure)
- [Key technical decisions](#key-technical-decisions)
  - [Native Federation over Webpack Module Federation](#native-federation-over-webpack-module-federation)
  - [Zoneless + standalone components](#zoneless--standalone-components)
  - [Signal-based shared state (broker)](#signal-based-shared-state-broker)
  - [Dynamic routes from REST API](#dynamic-routes-from-rest-api)
  - [Command palette](#command-palette)
  - [Dark mode token architecture](#dark-mode-token-architecture)
- [Getting started](#getting-started)
- [Ports](#ports)
- [Kubernetes](#kubernetes)
  - [Why K8s and micro-frontends are a natural fit](#why-k8s-and-micro-frontends-are-a-natural-fit)
  - [Gateway API — HTTPRoute over Ingress](#gateway-api--httproute-over-ingress)
  - [Helm chart structure](#helm-chart-structure)
  - [CRD-based menu registration](#crd-based-menu-registration)
  - [The full dynamic deployment loop](#the-full-dynamic-deployment-loop)
- [License](#license)

---

## What this demonstrates

| Feature | Implementation |
|---|---|
| Runtime module loading | Native Federation `loadRemoteModule` |
| Dynamic routes from API | `MenuRegistryService` + `MenuRouterSyncService` with Angular signals |
| Cross-MFE shared state | `AppStateService` singleton via NF `shared: { singleton: true }` |
| Cross-tab state sync | `BroadcastChannel` with loop-safe guard (`Set` + `queueMicrotask`) |
| Zoneless change detection | `provideZonelessChangeDetection()` across all apps |
| Standalone components | All apps use `bootstrapApplication` — no `NgModule` |
| Global command palette | Shell-level `S` shortcut + click-to-open from any remote |
| Dark mode | PrimeNG Aura semantic tokens + `.dark-theme` body class |
| Reactive chart themes | Chart.js dataset colors swap via `effect()` on theme signal |
| Independent deployability | Each app has its own `package.json`, build, and dev server |
| Dev ergonomics | `prestart` hook auto-clears NF cache; proxy rewrites `/api/menu` to mock |

---

## Architecture overview

```
Browser
  └── Gateway / Ingress
        ├── /                     → shell (host)           :4200
        ├── /remotes/menu/        → menu remote            :4201
        ├── /remotes/toolbar/     → toolbar remote         :4202
        ├── /remotes/overview/    → overview remote        :4203
        ├── /remotes/reports/     → reports remote         :4204
        ├── /remotes/analytics/   → analytics remote       :4205
        └── /remotes/export/      → export remote          :4206
```

```
Shell (host)
  ├─ Fetches GET /api/menu           →  builds NF manifest + loads feature remotes dynamically
  ├─ environment.infrastructureRemotes → always loads menu + toolbar (platform remotes)
  ├─ MenuRouterSyncService           →  effect() watches signal → router.resetConfig()
  └─ Renders layout
       ├─ <app-menu>     → loadRemoteModule('menu',    './Component')
       ├─ <app-toolbar>  → loadRemoteModule('toolbar', './Component')
       └─ <router-outlet>
            └─ loadChildren(() => loadRemoteModule(item.remote, item.exposedModule))
```

| App | Role | Port |
|---|---|---|
| `angular-shell` | Host — layout, routing, theme, command palette | 4200 |
| `angular-menu` | Remote — navigation sidebar with dynamic items | 4201 |
| `angular-toolbar` | Remote — topbar with user menu + appearance picker | 4202 |
| `angular-overview` | Remote — dashboard with Chart.js widgets | 4203 |
| `angular-reports` | Remote — reports page | 4204 |
| `angular-analytics` | Remote — analytics page | 4205 |
| `angular-export` | Remote — export page | 4206 |
| `angular-libs` | Shared library — `@czprz/broker` (state, menu registry) | — |

---

## Project structure

```
angular-micro-frontend/
├── angular-shell/           # Host application
│   ├── src/app/
│   │   ├── app.config.ts            # provideAppInitializer, providePrimeNG, router
│   │   ├── menu-router-sync.service.ts  # effect() watches signal → resetConfig()
│   │   ├── command-palette/         # Global search (S key / click)
│   │   ├── menu/                    # Shell wrapper that loads menu remote
│   │   └── toolbar/                 # Shell wrapper that loads toolbar remote
│   ├── src/assets/
│   │   ├── mock-menu.json           # Dev mock for /api/menu (with remoteEntry paths)
│   │   └── themes/                  # light.scss / dark-purple.scss
│   ├── src/environments/
│   │   ├── environment.ts           # infrastructureRemotes (menu/toolbar localhost URLs)
│   │   └── environment.prod.ts      # infrastructureRemotes (gateway paths)
│   └── proxy.conf.js                # Dev proxy: /api/menu → mock-menu.json
│
├── angular-menu/            # Sidebar remote
├── angular-toolbar/         # Topbar remote
├── angular-overview/        # Dashboard remote
├── angular-reports/         # Reports remote
├── angular-analytics/       # Analytics remote
├── angular-export/          # Export remote
│
├── angular-libs/            # Shared library workspace
│   └── projects/broker/src/lib/
│       ├── app-state.service.ts     # theme, token, users signals + BroadcastChannel
│       ├── menu/
│       │   ├── menu-item.model.ts   # MenuItem interface
│       │   └── menu-registry.service.ts  # load(), register(), unregister()
│       └── public-api.ts
│
├── package.json             # Root workspace + start/clean scripts
└── e2e/                     # Playwright E2E tests
```

---

## Key technical decisions

### Native Federation over Webpack Module Federation

Native Federation works at the ESM level — it uses browser-native `import()` instead of Webpack's custom module system. This means:
- No Webpack required in remotes; Angular CLI's default Vite/esbuild pipeline works unchanged.
- Remotes can be served from any static file host (CDN, nginx, S3).
- Shared singletons (Angular core, `@czprz/broker`, PrimeNG) are deduplicated at runtime via importmaps.

The trade-off is a native federation cache in `node_modules/.cache/native-federation/` that is keyed by package version (not content). Any time a shared package is rebuilt, this cache must be cleared — the `prestart` npm hook handles this automatically.

### Zoneless + standalone components

All apps opt out of Zone.js:

```ts
// every app.config.ts
provideZonelessChangeDetection()
```

This means change detection only runs when signals change or events fire explicitly — not on every async operation. Combined with standalone components and `bootstrapApplication` (no `NgModule`), the apps are leaner and easier to reason about.

### Signal-based shared state (broker)

`@czprz/broker` is a shared Angular library that NF loads as a singleton. It exposes:

- **`AppStateService`** — `theme`, `token`, `uri`, `users` as writable signals. Each signal is persisted to `localStorage` and broadcast to other tabs via `BroadcastChannel`. Incoming cross-tab updates are guarded with `Set<keyof AppState>` + `queueMicrotask()` to prevent feedback loops when signals hold reference types (arrays).

- **`MenuRegistryService`** — a signal-based registry of `MenuItem` objects. The shell's `provideAppInitializer` fetches `/api/menu` at startup and calls `menuRegistry.load()`. Any remote can call `register()` or `unregister()` at any time.

Because the library is a NF singleton, the same service instance is shared across shell, menu, toolbar, and all page remotes — no prop-drilling, no event buses.

### Dynamic routes from REST API

The shell never has hard-coded routes. On startup:

1. `MenuRouterSyncService` starts an `effect()` that watches `menuRegistry.items()`.
2. A `provideAppInitializer` fetches `GET /api/menu` and calls `menuRegistry.load(items)`.
3. The effect fires, maps each `MenuItem` to a `loadChildren` route, and calls `router.resetConfig()`.

```ts
// menu-router-sync.service.ts (simplified)
effect(() => {
  const dynamic: Routes = this.menuRegistry.items().map(item => ({
    path: item.path,
    loadChildren: () =>
      loadRemoteModule(item.remote, item.exposedModule)
        .then(m => m[item.routesExport ?? 'APP_ROUTES']),
  }));
  this.router.resetConfig([...dynamic, ...this.staticRoutes]);
});
```

In dev, `proxy.conf.js` rewrites `/api/menu` to the local `mock-menu.json`. In production, the real backend serves the same shape.

### Command palette

A VS Code-style global search lives in the shell as `CommandPaletteComponent`. It:
- Opens with `S` (when focus is not in an input) or by clicking the sidebar search bar.
- Filters all registered `MenuItem` objects from `MenuRegistryService` in real-time.
- Navigates with `↑` / `↓` / `Enter`, closes with `Escape`.
- Works cross-MFE: the sidebar menu calls `appState.openSearch()` which fires a `BroadcastChannel` message the shell listens to.

### Dark mode token architecture

PrimeNG Aura defines component tokens (e.g. `--p-card-background`) on `:root` as `var(--p-content-background)`. Chromium resolves `var()` chains eagerly at the `:root` scope, locking them to the light value even when `body.dark-theme` overrides `--p-content-background`.

The fix: explicitly re-declare affected tokens inside `.dark-theme` in `dark-purple.scss`:

```scss
.dark-theme {
  color-scheme: dark;
  --p-card-background:    var(--p-surface-800);  // #27272a
  --p-popover-background: var(--p-surface-800);
  // ... other affected tokens
}
```

Any custom overlay or panel you add should use `--p-card-background` rather than `--p-content-background` to inherit this fix automatically.

---

## Getting started

**Prerequisites:** Node.js 20+ (or 24.15.0+), npm 9+

```bash
# 1. Install all workspaces
npm install

# 2. Build the shared broker library
npm run build:libs

# 3. Start all 7 apps (auto-clears NF cache first)
npm run start
```

Open **http://localhost:4200**.

> The `prestart` hook runs `clean:nf` automatically before every `npm run start`, clearing the Native Federation external cache. You never need to run it manually.

Individual apps:

```bash
npm run start:shell     # :4200
npm run start:menu      # :4201
npm run start:toolbar   # :4202
# ... start:overview, start:reports, start:analytics, start:export
```

After changing `@czprz/broker`, rebuild it before restarting:

```bash
npm run build:libs
npm run start   # prestart clears NF cache automatically
```

---

## Ports

| App | Dev URL |
|---|---|
| Shell (host) | http://localhost:4200 |
| Menu remote | http://localhost:4201 |
| Toolbar remote | http://localhost:4202 |
| Overview remote | http://localhost:4203 |
| Reports remote | http://localhost:4204 |
| Analytics remote | http://localhost:4205 |
| Export remote | http://localhost:4206 |

---

## Kubernetes

### Why K8s and micro-frontends are a natural fit

The biggest advantage of micro-frontends is independent deployability — a team ships their feature without coordinating with anyone else. Kubernetes makes this operationally real:

| Capability | How it works |
|---|---|
| **Independent routing** | Each MFE owns its own `HTTPRoute` or `Ingress` rule. Installing a new chart automatically adds its path prefix to the gateway — no shared config to edit. |
| **Independent scaling** | The overview dashboard (heavy data) can run 10 replicas while the export page runs 1. |
| **Independent rollouts** | Rolling update one remote while all others keep serving traffic. |
| **Health isolation** | A crashing analytics pod does not affect the shell or menu. Liveness probes remove bad pods silently. |
| **Zero-downtime config** | Gateways merge and reload route rules without dropping connections. |

### Gateway API — HTTPRoute over Ingress

The Kubernetes [Gateway API](https://gateway-api.sigs.k8s.io/) (`HTTPRoute`) is the successor to `Ingress` and is the recommended approach for new deployments. It gives each micro-frontend team **full ownership of their routing rule** without needing cluster-level `Ingress` permissions.

```yaml
# charts/overview/templates/httproute.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: overview
  namespace: mfe-apps
spec:
  parentRefs:
    - name: mfe-gateway         # Shared gateway — owned by platform team
      namespace: mfe-infra
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /remotes/overview
      filters:
        - type: URLRewrite
          urlRewrite:
            path:
              type: ReplacePrefixMatch
              replacePrefixMatch: /
      backendRefs:
        - name: overview-svc
          port: 80
```

The shell builds its Native Federation manifest dynamically from the menu API response — each `MenuItem` carries a `remoteEntry` path that the operator writes in from the CRD spec:

```json
GET /api/menu
[
  { "remote": "overview", "remoteEntry": "/remotes/overview/remoteEntry.json", ... },
  { "remote": "reports",  "remoteEntry": "/remotes/reports/remoteEntry.json",  ... }
]
```

```ts
// main.ts — before Angular bootstraps
const items = await fetch('/api/menu').then(r => r.json());
const manifest = {
  ...environment.infrastructureRemotes,            // menu, toolbar — always present
  ...Object.fromEntries(items.map(i => [i.remote, i.remoteEntry])),  // CRD-driven
};
await initFederation(manifest);
```

When a team **deploys** their chart, their `HTTPRoute` is created, the operator registers the `MenuEntry`, and the shell discovers the new remote on the next load. When they **remove** it, the route disappears and the menu item is gone. No other team touches anything.

### Helm chart structure

```
charts/
├── base/                   # Platform team — gateway, shell, menu-service
│   └── templates/
│       ├── gateway.yaml            # Shared Gateway resource
│       ├── shell-deployment.yaml
│       ├── shell-httproute.yaml    # Catches / (default)
│       └── menu-service.yaml       # REST API serving /api/menu
│
├── overview/               # Overview team — fully self-contained
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── httproute.yaml          # /remotes/overview → overview-svc
│
├── reports/                # Reports team
├── analytics/              # Analytics team
└── export/                 # Export team
```

```bash
# Platform team installs the gateway and shell once
helm install base ./charts/base

# Each feature team deploys independently
helm install overview  ./charts/overview
helm install reports   ./charts/reports

# Remove a feature — route and pods gone, nothing else touched
helm uninstall reports
```

### CRD-based menu registration

Hard-coding the menu in a `ConfigMap` or environment variable requires a shell restart every time a route changes. A better approach: a **`MenuEntry` CRD** that a lightweight operator watches. When a Helm chart installs a `MenuEntry`, the operator syncs it to the menu service. When the chart is removed, the operator de-registers it automatically.

```yaml
# CRD definition (installed once by the platform team)
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: menuentries.mfe.example.com
spec:
  group: mfe.example.com
  versions:
    - name: v1alpha1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              required: [label, path, remote, exposedModule]
              properties:
                label:        { type: string }
                path:         { type: string }
                icon:         { type: string }
                group:        { type: string }
                remote:       { type: string }
                exposedModule: { type: string }
                routesExport: { type: string }
                permissions:
                  type: array
                  items: { type: string }
  scope: Namespaced
  names:
    plural: menuentries
    singular: menuentry
    kind: MenuEntry
```

Each feature chart ships one `MenuEntry` resource:

```yaml
# charts/overview/templates/menuentry.yaml
apiVersion: mfe.example.com/v1alpha1
kind: MenuEntry
metadata:
  name: overview
  namespace: mfe-apps
spec:
  label: Dashboard
  path: dashboard
  icon: pi pi-home
  group: Overview
  remote: overview
  exposedModule: ./routes
  permissions:
    - user
    - admin
```

A simple operator (e.g. built with [Kopf](https://kopf.readthedocs.io/) or [controller-runtime](https://github.com/kubernetes-sigs/controller-runtime)) watches for `MenuEntry` create/update/delete events and calls the menu service's REST API:

```
MenuEntry created  →  POST  /api/menu   { ...spec }
MenuEntry deleted  →  DELETE /api/menu/{name}
```

The shell fetches `/api/menu` on load (or via a WebSocket push), builds dynamic routes from the response, and the new page appears — **without touching the shell, the menu service, or any other team's chart**.

### The full dynamic deployment loop

```
A feature team ships a new micro-frontend
  │
  ├─ 1. helm install reports ./charts/reports
  │        Kubernetes creates:
  │          - Deployment + Service  (the Angular remote)
  │          - HTTPRoute             (path /remotes/reports → reports-svc)
  │          - MenuEntry CR          (label, path, icon, permissions)
  │
  ├─ 2. Operator detects MenuEntry create
  │        POST /api/menu  { label: "Reports", path: "reports", ... }
  │
  ├─ 3. User opens the shell (or shell re-polls /api/menu)
  │        MenuRegistryService.load(items)
  │        MenuRouterSyncService effect() fires → router.resetConfig()
  │        Navigation sidebar and command palette now include "Reports"
  │
  └─ 4. User navigates to /reports
           loadRemoteModule('reports', './routes') fetches from gateway
           Angular boots the remote bundle
           Reports page renders ✓

The team removes their feature
  │
  ├─ 1. helm uninstall reports
  │        HTTPRoute deleted → gateway stops routing /remotes/reports
  │        MenuEntry deleted → operator calls DELETE /api/menu/reports
  │
  └─ 2. Shell re-polls: "reports" gone from response
           Route and nav link disappear automatically ✓
           No shell rebuild. No config edits. No other team involved.
```

This is where micro-frontends and Kubernetes compound each other's value. The independence you get architecturally (each team owns their code) becomes independence you get operationally (each team owns their deployment) — and the CRD bridges the two by making routing and menu registration declarative Kubernetes resources.

---

## Inspiration

- [The Microfrontend Revolution — Module Federation with Angular](https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/) — angulararchitects.io
- [Module Federation with NGXS](https://www.ngxs.io/recipes/module-federation) — ngxs.io
- [Building Angular Micro-Frontend with NgRx State Sharing and Nx CLI](https://itnext.io/building-angular-micro-frontend-with-ngrx-state-sharing-and-nx-cli-7e9af10ebd03) — itnext.io

---

## License

[MIT](LICENSE)
