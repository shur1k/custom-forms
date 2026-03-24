import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { adminGuard, authGuard, homeRedirectGuard, loggedInGuard, superuserGuard } from './guards';
import { Home } from './components';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class RedirectPage {}

export const appRoutes: Route[] = [
  {
    path: '',
    component: RedirectPage,
    canActivate: [homeRedirectGuard],
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [authGuard, adminGuard],
    component: Home,
  },
  {
    path: 'login',
    canActivate: [loggedInGuard],
    loadComponent: () =>
      import('./components/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [loggedInGuard],
    loadComponent: () =>
      import('./components/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'designer',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: 'http://localhost:4201/remoteEntry.json',
        exposedModule: './Routes',
      }).then((m) => m.appRoutes),
  },
  {
    path: 'runtime',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: 'http://localhost:4202/remoteEntry.json',
        exposedModule: './Routes',
      }).then((m) => m.appRoutes),
  },
  {
    path: 'user-administration',
    canActivate: [authGuard, superuserGuard],
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: 'http://localhost:4203/remoteEntry.json',
        exposedModule: './Routes',
      }).then((m) => m.appRoutes),
  },
];
