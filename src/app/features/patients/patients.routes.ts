import { Routes } from '@angular/router';

export const patientsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./patient-list/patients-list').then((m) => m.PatientsList),
  },
  {
    path: 'new',
    loadComponent: () => import('./patient-form/patients-form').then((m) => m.PatientsForm),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./patient-details/patients-details').then((m) => m.PatientsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./patient-form/patients-form').then((m) => m.PatientsForm),
  },
];
