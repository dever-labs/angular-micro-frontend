export interface MenuItem {
  /** Navigation label shown in the menu */
  label: string;
  /** URL path segment (e.g. "dashboard") */
  path: string;
  /** Optional PrimeNG icon class (e.g. "pi pi-chart-bar") */
  icon?: string;
  /** Optional group/category label for visual grouping */
  group?: string;
  /** Name of the Native Federation remote (unique key, e.g. "overview") */
  remote: string;
  /** URL to the remote's remoteEntry.json — set by the menu service from the CRD spec */
  remoteEntry: string;
  /** Exposed module path on the remote (e.g. "./routes") */
  exposedModule: string;
  /** Exported routes array name on the remote module (defaults to "APP_ROUTES"). */
  routesExport?: string;
}
