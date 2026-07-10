export const environment = {
  production: false,
  // Platform-level remotes that are always deployed alongside the shell.
  // Feature remotes are discovered dynamically from the menu service (CRD-driven).
  infrastructureRemotes: {
    menu: 'http://localhost:4201/remoteEntry.json',
    toolbar: 'http://localhost:4202/remoteEntry.json',
  },
};
