const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'reports',
  exposes: {
    './Component': './projects/reports/src/lib/reports.component.ts',
    './routes': './projects/reports/src/lib/reports.routes.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@dever-labs/ngx-mfe-broker': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket', 'zone.js'],
  features: { ignoreUnusedDeps: true },
});
