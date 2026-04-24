import { Routes } from '@angular/router';

export const documentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./document-list/documents-list').then((m) => m.DocumentsList),
  },
  {
    path: 'new',
    loadComponent: () => import('./document-form/documents-form').then((m) => m.DocumentsForm),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./document-details/documents-details').then((m) => m.DocumentsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./document-form/documents-form').then((m) => m.DocumentsForm),
  },
];
