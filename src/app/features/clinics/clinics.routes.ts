import { Routes } from '@angular/router';

export const clinicsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./clinic-list/clinics-list').then((m) => m.ClinicsList),
  },
  {
    path: 'new',
    loadComponent: () => import('./clinic-form/clinics-form').then((m) => m.ClinicsForm),
  },
  {
    path: ':uuid',
    loadComponent: () => import('./clinic-details/clinics-details').then((m) => m.ClinicsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./clinic-form/clinics-form').then((m) => m.ClinicsForm),
  },
];
