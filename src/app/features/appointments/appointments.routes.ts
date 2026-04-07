import { Routes } from '@angular/router';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./appointment-list/appointments-list').then((m) => m.AppointmentsList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./appointment-form/appointments-form').then((m) => m.AppointmentsForm),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./appointment-details/appointments-details').then((m) => m.AppointmentsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () =>
      import('./appointment-form/appointments-form').then((m) => m.AppointmentsForm),
  },
];
