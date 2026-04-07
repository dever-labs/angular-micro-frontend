# Angular Micro-Frontend

A working reference implementation of an **Angular micro-frontend architecture** using [Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation). The project demonstrates how to split a large Angular application into independently deployable micro-frontends that are composed at runtime by a shell (host) application.

---

## Table of Contents

- [Purpose](#purpose)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Build](#build)
  - [Run](#run)
- [Ports](#ports)
- [Shared Libraries](#shared-libraries)
- [Kubernetes](#kubernetes)
  - [Why K8s and micro-frontends are a natural fit](#why-k8s-and-micro-frontends-are-a-natural-fit)
  - [Example manifests](#example-manifests)
- [Going Further — Menu Service](#going-further--menu-service)
  - [The problem with static manifests](#the-problem-with-static-manifests)
  - [What a menu-service looks like](#what-a-menu-service-looks-like)
  - [Shell integration](#shell-integration)
- [Inspiration](#inspiration)
- [License](#license)

---

## Purpose

This repo exists to show a practical, runnable example of:

- **Native Federation** with Angular — loading remote Angular modules/components at runtime without a monorepo build step.
- **Independent deployability** — each micro-frontend (menu, toolbar, overview) can be built and deployed on its own.
- **Shared singleton dependencies** — Angular core packages and shared libraries are deduplicated across remotes using Native Federation's `shareAll` / `singleton` options.
- **nginx reverse proxy** — a single entry point that routes requests to the correct micro-frontend container.

---

## Architecture

```
Browser
  └── proxy (nginx :80)
        ├── /                     → shell (host app)      :4200
        ├── /getModule/menu/      → menu (remote)         :4201
        ├── /getModule/toolbar/   → toolbar (remote)      :4202
        └── /getModule/overview/  → overview (remote)     :4203
```

| App | Role | Federation |
|---|---|---|
| `angular-shell` | Host / shell | Consumes menu, toolbar, and overview remotes via `federation.manifest.json` |
| `angular-menu` | Remote | Exposes `MenuComponent` |
| `angular-toolbar` | Remote | Exposes `ToolbarComponent` |
| `angular-overview` | Remote | Exposes `OverviewModule` |
| `angular-libs` | Shared library | Provides the `broker` library used by shell & toolbar |
| `proxy` | nginx reverse proxy | Single ingress, routes to remotes |

---

## Project Structure

```
angular-micro-frontend/
├── angular-shell/          # Host application (Angular 21, PrimeNG)
├── angular-menu/           # Remote — navigation menu component
├── angular-toolbar/        # Remote — toolbar component
├── angular-overview/       # Remote — overview module with charts
├── angular-libs/           # Shared Angular library (broker)
├── proxy/                  # nginx reverse proxy config & Dockerfile
├── build.ps1               # Build script for all apps (PowerShell)
└── docker-compose.yml      # Orchestrates all services
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [Docker](https://www.docker.com/) & Docker Compose

---

## Getting Started

### Local development (recommended for first-time setup)

The fastest way to see the app running is with Node directly — no Docker required.

**1. Install dependencies**

```bash
npm install --legacy-peer-deps
```

This installs the root workspace and all sub-packages in one go.

**2. Start everything**

```bash
npm run dev
```

This builds the shared `broker` library and then starts all four apps concurrently with colour-coded output:

| Colour | App | URL |
|---|---|---|
| cyan | menu | http://localhost:4201 |
| blue | toolbar | http://localhost:4202 |
| magenta | overview | http://localhost:4203 |
| green | shell | http://localhost:4200 |

Open **http://localhost:4200** in your browser. The shell loads and lazily pulls in each remote as you navigate.

> The `dev` script is equivalent to running `npm run build:libs && npm run start`. Individual apps can also be started in isolation with `npm run start:shell`, `start:menu`, `start:toolbar`, or `start:overview`.

---

### Production-like run (Docker)

To test the full nginx proxy setup as it would run in a real deployment:

### Build

```powershell
.\build.ps1
```

The script:
1. Builds the `broker` shared library from `angular-libs`.
2. Installs dependencies in each app (the `broker` lib is referenced via a local `file:` path in each app's `package.json`).
3. Builds `angular-menu`, `angular-overview`, `angular-toolbar`, and `angular-shell` for production.

### Run

```bash
docker-compose up -d
```

Open **http://localhost:8080** — all traffic flows through the nginx proxy, mirroring the Kubernetes ingress setup.

```bash
docker-compose down
```

---

## Ports

**Local dev** (`npm run dev`):

| Service | URL |
|---|---|
| shell | http://localhost:4200 |
| menu | http://localhost:4201 |
| toolbar | http://localhost:4202 |
| overview | http://localhost:4203 |

**Docker / production** (`docker-compose up`):

| Service | Port |
|---|---|
| proxy (entry point) | 8080 |
| shell | 4200 |
| menu | 4201 |
| toolbar | 4202 |
| overview | 4203 |

---

## Shared Libraries

`angular-libs` contains the **broker** library — a shared package referenced locally via `file:../angular-libs/dist/broker` in each app's `package.json`. After building `broker`, running `npm install --legacy-peer-deps` in each app resolves the symlink so Native Federation can share it as a singleton across all remotes.

---

## Kubernetes

### Why K8s and micro-frontends are a natural fit

In the Docker Compose setup, adding or removing a micro-frontend means editing `nginx.conf` and `docker-compose.yml` by hand, then redeploying everything. Kubernetes — combined with Helm — removes that friction entirely.

The key insight is that **each micro-frontend ships its own Helm chart**. It owns its Deployment, Service, and Ingress rule. No other chart needs to change when it is installed or removed. The nginx Ingress controller merges path rules from all installed Ingress resources automatically, so each chart is fully self-contained and independently deployable.

Additional benefits in K8s:

- **Independent scaling** — a heavily used `overview` pod can scale to 10 replicas while `menu` stays at 1.
- **Independent rollouts** — deploy a new version of `toolbar` with a rolling update while everything else keeps running.
- **Health-based traffic** — readiness/liveness probes keep broken pods out of rotation automatically.
- **Zero-downtime ingress changes** — nginx Ingress controllers merge and reload rules without dropping connections.

### Helm chart structure

There is a **base chart** that is always present — it contains the shell, the menu-service, and any other core infrastructure. Everything else is optional and can be installed or removed independently.

```
charts/
├── base/                   # Always installed — shell, menu-service, ingress controller
│   ├── Chart.yaml
│   └── templates/
│       ├── shell-deployment.yaml
│       ├── shell-service.yaml
│       ├── shell-ingress.yaml
│       ├── menu-service-deployment.yaml
│       └── menu-service-service.yaml
│
├── overview/               # Optional — install or remove without touching anything else
│   ├── Chart.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── ingress.yaml    # Owns its own /getModule/overview path rule
│
├── toolbar/                # Optional
│   ├── Chart.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── ingress.yaml
│
└── reporting/              # Optional — a brand-new team deploys this independently
    ├── Chart.yaml
    └── templates/
        ├── deployment.yaml
        ├── service.yaml
        └── ingress.yaml
```

Each optional chart's Ingress is self-contained. Here is `overview` as an example:

```yaml
# charts/overview/templates/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: overview
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
    - http:
        paths:
          - path: /getModule/overview(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: overview
                port:
                  number: 80
```

Installing and removing a micro-frontend is a single Helm command:

```bash
# Add a new micro-frontend — the cluster starts routing to it immediately
helm install overview ./charts/overview

# Remove it — the Ingress rule disappears with the chart
helm uninstall overview
```

Combined with the menu-service's self-registration (described below), **a single `helm install` is all it takes** to make a new feature live for the right users — and `helm uninstall` cleanly removes it without touching any other chart.

---

## Going Further — Menu Service

### The problem with static manifests

Right now the shell reads `federation.manifest.json` at startup to know which remotes exist and where they live:

```json
{
  "menu":     "http://localhost:4201/remoteEntry.json",
  "toolbar":  "http://localhost:4202/remoteEntry.json",
  "overview": "http://localhost:4203/remoteEntry.json"
}
```

This works, but it is **static** — adding a new micro-frontend still requires a shell rebuild to update the file. It also carries no information about *who* is allowed to load each remote, making permission checks ad-hoc and scattered across the shell.

### What a menu-service looks like

A **menu-service** is a small backend (REST or GraphQL) that owns the registry of all available micro-frontends and their access rules. Rather than being managed centrally, each micro-frontend **self-registers on pod startup** and **de-registers on shutdown** — the registry always reflects what is actually running in the cluster.

Self-registration sequence:

```
micro-frontend pod starts
  └── POST /api/register
        {
          "id":             "reporting",
          "label":          "Reporting",
          "icon":           "pi pi-file",
          "remoteEntry":    "http://cluster/getModule/reporting/remoteEntry.json",
          "exposedModule":  "./Module",
          "routePath":      "reporting",
          "permissions":    ["admin"]
        }

micro-frontend pod stops (preStop hook)
  └── DELETE /api/register/reporting
```

The shell then sees `reporting` in the menu automatically — no config files touched, no shell rebuild triggered.

Example full registry response:

```json
GET /api/menu-items

[
  {
    "id": "overview",
    "label": "Overview",
    "icon": "pi pi-chart-bar",
    "remoteEntry": "http://cluster/getModule/overview/remoteEntry.json",
    "exposedModule": "./Module",
    "routePath": "overview",
    "permissions": ["user", "admin"]
  },
  {
    "id": "reporting",
    "label": "Reporting",
    "icon": "pi pi-file",
    "remoteEntry": "http://cluster/getModule/reporting/remoteEntry.json",
    "exposedModule": "./Module",
    "routePath": "reporting",
    "permissions": ["admin"]
  }
]
```

Key fields:

| Field | Purpose |
|---|---|
| `remoteEntry` | URL the shell passes to Native Federation's `loadRemoteModule` |
| `exposedModule` | The federation-exposed entry point (e.g. `./Module`, `./Component`) |
| `routePath` | Angular router path the shell registers dynamically |
| `permissions` | Roles allowed to load this micro-frontend |

### Shell integration

On startup the shell:

1. Authenticates the user and retrieves their roles (e.g. from a JWT).
2. Calls `GET /api/menu-items` and filters the response to entries the user's roles satisfy.
3. Dynamically registers Angular routes and builds the navigation menu from the filtered list — no hard-coded routes, no static manifest.

```ts
// Simplified shell bootstrap
const items = await menuService.getAuthorizedItems(userRoles);

const dynamicRoutes: Routes = items.map(item => ({
  path: item.routePath,
  loadComponent: () =>
    loadRemoteModule(item.remoteEntry, item.exposedModule)
      .then(m => m.default ?? m[item.exposedModule]),
}));

router.resetConfig([...staticRoutes, ...dynamicRoutes]);
```

With this in place, deploying a new micro-frontend to Kubernetes and adding one row to the menu-service database is all it takes — **the shell discovers and loads it automatically**, no code change required.

### Fully dynamic deployment — the complete loop

Combining K8s, self-registering micro-frontends, and a dynamic shell produces a system where **adding or removing a feature requires no changes to any other service**:

```
Developer ships a new micro-frontend
  │
  ├─ 1. helm install reporting ./charts/reporting
  │        K8s schedules pod, chart's own Ingress rule goes live immediately
  │
  ├─ 2. Pod starts → POST /api/register  (self-registration)
  │        menu-service stores the entry with its permissions
  │
  ├─ 3. User opens the shell
  │        Shell fetches /api/menu-items, filters by user roles
  │        Angular router gets a new dynamic route: /reporting
  │        Navigation menu renders a new "Reporting" link
  │
  └─ 4. User navigates to /reporting
           Shell calls loadRemoteModule(remoteEntry, exposedModule)
           Native Federation fetches and boots the remote bundle
           Feature is live ✓

Developer removes a micro-frontend
  │
  ├─ 1. helm uninstall reporting
  │        Pod shutdown triggers preStop hook → DELETE /api/register/reporting
  │        Chart's Ingress rule is removed
  │
  └─ 2. Next shell load: /reporting no longer in menu-items
           Route and nav link disappear automatically ✓
```

No shell rebuild. No config file edits. No other team unblocked or involved. Each team owns their micro-frontend from code to cluster.

---

## Inspiration

- [The Microfrontend Revolution — Module Federation with Angular](https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/) — angulararchitects.io
- [Module Federation with NGXS](https://www.ngxs.io/recipes/module-federation) — ngxs.io
- [Building Angular Micro-Frontend with NgRx State Sharing and Nx CLI](https://itnext.io/building-angular-micro-frontend-with-ngrx-state-sharing-and-nx-cli-7e9af10ebd03) — itnext.io

---

## License

[MIT](LICENSE)
