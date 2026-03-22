import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'designer',
    pathMatch: 'full',
  },
  // login + register routes added in Step 5
  {
    path: 'designer',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('designer', './Routes').then(m => m.appRoutes),
  },
  {
    path: 'runtime',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('runtime', './Routes').then(m => m.appRoutes),
  },
  {
    path: 'user-administration',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      loadRemoteModule('user-administration', './Routes').then(m => m.appRoutes),
  },
];
