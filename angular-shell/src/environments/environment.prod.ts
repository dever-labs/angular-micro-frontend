export const environment = {
  production: true,
  // In production, menu and toolbar are routed through the API gateway alongside the shell.
  infrastructureRemotes: {
    menu: '/menu/remoteEntry.json',
    toolbar: '/toolbar/remoteEntry.json',
  },
};
