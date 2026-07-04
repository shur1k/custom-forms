import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./form-list/form-list').then((m) => m.FormList),
  },
  {
    path: ':id',
    loadComponent: () => import('./form-editor/form-editor').then((m) => m.FormEditor),
  },
  {
    path: ':id/schema',
    loadComponent: () => import('./schema-viewer/schema-viewer').then((m) => m.SchemaViewer),
  },
];
