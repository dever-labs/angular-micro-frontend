export const environment = {
  production: false,
  // Platform-level remotes that are always deployed alongside the shell.
  // Feature remotes are discovered dynamically from the menu service (CRD-driven).
  infrastructureRemotes: {
    menu: '/remotes/menu/remoteEntry.json',
    toolbar: '/remotes/toolbar/remoteEntry.json',
  },
};
