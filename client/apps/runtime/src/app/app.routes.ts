import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./form-list/form-list').then((m) => m.FormList),
  },
  {
    path: 'form-viewer/:schemaId',
    loadComponent: () =>
      import('./form-viewer/form-viewer').then((m) => m.FormViewer),
  },
];
