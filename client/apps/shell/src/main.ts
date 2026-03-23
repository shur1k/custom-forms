import { initFederation } from '@angular-architects/native-federation';

// Initialise federation with no pre-registered remotes.
// Each remote is loaded on-demand when its route is first activated (see app.routes.ts).
initFederation({})
  .then(() => import('./bootstrap'))
  .catch(err => console.error(err));
