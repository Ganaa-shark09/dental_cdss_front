import { Routes } from '@angular/router';

export const treatmentPlansRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./treatment-plan-list/treatment-plans-list').then((m) => m.TreatmentPlansList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./treatment-plan-form/treatment-plans-form').then((m) => m.TreatmentPlansForm),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./treatment-plan-details/treatment-plans-details').then(
        (m) => m.TreatmentPlansDetails,
      ),
  },
  {
    path: ':uuid/edit',
    loadComponent: () =>
      import('./treatment-plan-form/treatment-plans-form').then((m) => m.TreatmentPlansForm),
  },
];
