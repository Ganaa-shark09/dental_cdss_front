export const ROUTES = {
  root: '',
  auth: {
    base: 'auth',
    login: 'auth/login',
    forgotPassword: 'auth/forgot-password',
  },
  app: {
    dashboard: 'dashboard',
    users: 'users',
    clinics: 'clinics',
    staff: 'staff',
    patients: 'patients',
    appointments: 'appointments',
    consultations: 'consultations',
    odontology: 'odontology',
    cdss: 'cdss',
    prescriptions: 'prescriptions',
    documents: 'documents',
    reports: 'reports',
    treatmentPlans: 'treatment-plans',
    auditLogs: 'audit-logs',
  },
} as const;
