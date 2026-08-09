import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list').then((m) => m.UserList),
  },
];
