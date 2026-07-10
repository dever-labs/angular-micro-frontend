export interface MenuItem {
  /** Navigation label shown in the menu */
  label: string;
  /** URL path segment (e.g. "dashboard") */
  path: string;
  /** Optional PrimeNG icon class (e.g. "pi pi-chart-bar") */
  icon?: string;
  /** Optional group/category label for visual grouping */
  group?: string;
  /** Name of the Native Federation remote (must match federation.manifest.json key) */
  remote: string;
  /** Exposed module path on the remote (e.g. "./routes") */
  exposedModule: string;
}
