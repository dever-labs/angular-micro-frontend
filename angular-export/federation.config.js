const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'export',
  exposes: {
    './Component': './projects/export/src/lib/export.component.ts',
    './routes': './projects/export/src/lib/export.routes.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@czprz/broker': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket', 'zone.js'],
  features: { ignoreUnusedDeps: true },
});
