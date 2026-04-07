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

## Inspiration

- [The Microfrontend Revolution — Module Federation with Angular](https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/) — angulararchitects.io
- [Module Federation with NGXS](https://www.ngxs.io/recipes/module-federation) — ngxs.io
- [Building Angular Micro-Frontend with NgRx State Sharing and Nx CLI](https://itnext.io/building-angular-micro-frontend-with-ngrx-state-sharing-and-nx-cli-7e9af10ebd03) — itnext.io

---

## License

[MIT](LICENSE)
