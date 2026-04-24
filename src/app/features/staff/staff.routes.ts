import { Routes } from '@angular/router';

export const staffRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./staff-list/staff-list').then((m) => m.StaffList),
  },
  {
    path: 'new',
    loadComponent: () => import('./staff-form/staff-form').then((m) => m.StaffForm),
  },
  {
    path: ':uuid',
    loadComponent: () => import('./staff-details/staff-details').then((m) => m.StaffDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./staff-form/staff-form').then((m) => m.StaffForm),
  },
];
