import { Routes } from '@angular/router';

export const prescriptionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./prescription-list/prescriptions-list').then((m) => m.PrescriptionsList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./prescription-form/prescriptions-form').then((m) => m.PrescriptionsForm),
  },
  {
    path: ':uuid/print',
    loadComponent: () =>
      import('./prescription-print/prescriptions-print').then((m) => m.PrescriptionsPrint),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./prescription-details/prescriptions-details').then((m) => m.PrescriptionsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () =>
      import('./prescription-form/prescriptions-form').then((m) => m.PrescriptionsForm),
  },
];
