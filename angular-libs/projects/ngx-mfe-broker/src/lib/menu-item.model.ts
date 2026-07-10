export interface MenuItem {
  /** Display label shown in the menu. */
  label: string;
  /** Router path this item navigates to. */
  path: string;
  /** Optional icon identifier (e.g. PrimeNG icon class). */
  icon?: string;
  /** Optional group/category label for visual grouping in the menu. */
  group?: string;
  /** Name of the Native Federation remote (unique key, e.g. "overview"). */
  remote: string;
  /** Path to the remote's remoteEntry.json (e.g. "/remotes/overview/remoteEntry.json"). */
  remoteEntry: string;
  /** Exposed module path on the remote (e.g. "./routes"). */
  exposedModule: string;
  /** Exported routes array name on the remote module (defaults to "APP_ROUTES"). */
  routesExport?: string;
}
