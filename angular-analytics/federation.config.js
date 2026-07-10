const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'analytics',
  exposes: {
    './Component': './projects/analytics/src/lib/analytics.component.ts',
    './routes': './projects/analytics/src/lib/analytics.routes.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@czprz/broker': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket', 'zone.js'],
  features: { ignoreUnusedDeps: true },
});
