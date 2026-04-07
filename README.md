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

### Build

Run the PowerShell build script from the repository root. It installs dependencies and produces production builds for every app:

```powershell
.\build.ps1
```

The script:
1. Builds the `broker` shared library from `angular-libs`.
2. Installs dependencies in each app (the `broker` lib is referenced via a local `file:` path in each app's `package.json`).
3. Builds `angular-menu`, `angular-overview`, `angular-toolbar`, and `angular-shell` for production.

### Run

Once all apps are built, start all services with Docker Compose:

```bash
docker-compose up -d
```

Open your browser at **[http://localhost](http://localhost)** — the nginx proxy serves the shell and lazily loads each micro-frontend on demand.

To stop all services:

```bash
docker-compose down
```

---

## Ports

| Service | Port |
|---|---|
| proxy (entry point) | 80 |
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

In the Docker Compose setup, adding or removing a micro-frontend means editing `nginx.conf` and `docker-compose.yml` by hand, then redeploying everything. Kubernetes removes that friction entirely.

Each micro-frontend becomes its own **Deployment + Service**, and a single **Ingress** resource replaces the hand-rolled nginx proxy. To add a new micro-frontend you add one Deployment, one Service, and one path rule to the Ingress — no other services are touched or restarted. Removing one is equally surgical.

Additional benefits in K8s:

- **Independent scaling** — a heavily used `overview` pod can scale to 10 replicas while `menu` stays at 1.
- **Independent rollouts** — deploy a new version of `toolbar` with a rolling update while everything else keeps running.
- **Health-based traffic** — readiness/liveness probes keep broken pods out of rotation automatically.
- **Zero-downtime ingress changes** — nginx Ingress controllers reload config without dropping connections.

### Example manifests

Each micro-frontend follows the same pattern. Here is `overview` as a representative example:

```yaml
# overview-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: overview
spec:
  replicas: 2
  selector:
    matchLabels:
      app: overview
  template:
    metadata:
      labels:
        app: overview
    spec:
      containers:
        - name: overview
          image: overview:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: overview
spec:
  selector:
    app: overview
  ports:
    - port: 80
```

All micro-frontends are then wired together through a single Ingress:

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: micro-frontend-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: shell
                port:
                  number: 80
          - path: /getModule/overview(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: overview
                port:
                  number: 80
          - path: /getModule/menu(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: menu
                port:
                  number: 80
          - path: /getModule/toolbar(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: toolbar
                port:
                  number: 80
```

To add a brand-new micro-frontend (e.g. `reporting`), the only changes needed are:
1. Deploy its `Deployment` + `Service`.
2. Append one `path` block to the Ingress.
3. Register it in the menu-service (see below) — **no rebuild of the shell required**.

But you can remove even step 2 by automating Ingress management. Tools like [external-dns](https://github.com/kubernetes-sigs/external-dns) or a custom [Kubernetes operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) can watch for new micro-frontend Deployments (identified by a label such as `role: micro-frontend`) and patch the Ingress automatically. Combined with the menu-service below, **deploying a new micro-frontend becomes a single `kubectl apply`** — the cluster routes to it, and the shell discovers it, with no human in the loop.

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
  ├─ 1. kubectl apply -f reporting-deployment.yaml
  │        K8s schedules pod, Ingress rule added (operator or manual)
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
  ├─ 1. kubectl delete deployment reporting
  │        Pod shutdown triggers preStop hook → DELETE /api/register/reporting
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
