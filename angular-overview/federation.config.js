const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'overview',
  exposes: {
    './Component': './projects/overview/src/lib/overview.component.ts',
    './routes': './projects/overview/src/lib/overview.routes.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@dever-labs/ngx-mfe-broker': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'zone.js',
  ],
  features: {
    ignoreUnusedDeps: true,
  },
});
