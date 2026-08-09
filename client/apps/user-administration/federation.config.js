const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'user-administration',

  exposes: {
    './Routes': './client/apps/user-administration/src/app/app.routes.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@ag-grid-community/angular',
    '@ag-grid-community/core',
    '@ag-grid-community/client-side-row-model',
    '@ag-grid-community/styles',
  ],

  features: {
    ignoreUnusedDeps: true,
  },
});
