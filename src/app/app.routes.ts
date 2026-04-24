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
      {
        path: ROUTES.app.staff,
        loadChildren: () => import('./features/staff/staff.routes').then((m) => m.staffRoutes),
      },
      {
        path: ROUTES.app.appointments,
        loadChildren: () =>
          import('./features/appointments/appointments.routes').then((m) => m.appointmentsRoutes),
      },
      {
        path: ROUTES.app.consultations,
        loadChildren: () =>
          import('./features/consultations/consultations.routes').then(
            (m) => m.consultationsRoutes,
          ),
      },
      {
        path: ROUTES.app.prescriptions,
        loadChildren: () =>
          import('./features/prescriptions/prescriptions.routes').then(
            (m) => m.prescriptionsRoutes,
          ),
      },
      {
        path: ROUTES.app.documents,
        loadChildren: () =>
          import('./features/documents/documents.routes').then((m) => m.documentsRoutes),
      },
      {
        path: ROUTES.app.treatmentPlans,
        loadChildren: () =>
          import('./features/treatment-plans/treatment-plans.routes').then(
            (m) => m.treatmentPlansRoutes,
          ),
      },
      {
        path: ROUTES.app.cdss,
        loadChildren: () => import('./features/cdss/cdss.routes').then((m) => m.cdssRoutes),
      },
      {
        path: ROUTES.app.reports,
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.reportsRoutes),
      },
      {
        path: ROUTES.app.auditLogs,
        loadChildren: () =>
          import('./features/audit-logs/audit-logs.routes').then((m) => m.auditLogsRoutes),
      },
      {
        path: ROUTES.app.odontology,
        loadChildren: () =>
          import('./features/odontology/odontology.routes').then((m) => m.odontologyRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: ROUTES.auth.login,
  },
];
