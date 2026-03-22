import { initFederation } from '@angular-architects/native-federation';

initFederation({
  'designer':            'http://localhost:4201/remoteEntry.json',
  'runtime':             'http://localhost:4202/remoteEntry.json',
  'user-administration': 'http://localhost:4203/remoteEntry.json',
})
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
