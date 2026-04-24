import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ROUTES } from './core/constants/route.constants';

export const routes: Routes = [
  {
    path: '',
    redirectTo: ROUTES.auth.login,
    pathMatch: 'full',
  },
  {
    path: ROUTES.auth.base,
    loadComponent: () =>
      import('./features/auth/components/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/components/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: ROUTES.app.dashboard,
        loadComponent: () => import('./features/dashboard/home/home').then((m) => m.Home),
      },
      {
        path: ROUTES.app.clinics,
        loadChildren: () =>
          import('./features/clinics/clinics.routes').then((m) => m.clinicsRoutes),
      },
      {
        path: ROUTES.app.patients,
        loadChildren: () =>
          import('./features/patients/patients.routes').then((m) => m.patientsRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: ROUTES.auth.login,
  },
];
