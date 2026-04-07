import { Routes } from '@angular/router';

export const consultationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./consultation-list/consultations-list').then((m) => m.ConsultationsList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./consultation-form/consultations-form').then((m) => m.ConsultationsForm),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./consultation-details/consultations-details').then((m) => m.ConsultationsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () =>
      import('./consultation-form/consultations-form').then((m) => m.ConsultationsForm),
  },
];
