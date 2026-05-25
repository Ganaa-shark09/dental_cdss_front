export interface DashboardTotals {
  patients: number;
  appointments: number;
  consultations: number;
  users: number;
}

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  caption: string;
  icon: string;
  route: string;
}

export interface WeeklyAppointment {
  day: string;
  date: string;
  count: number;
}

export interface AppointmentStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface ClinicalSnapshot {
  total_records: number;
  completion_rate: number;
  last_updated: string;
}

export interface DashboardQuickLink {
  label: string;
  caption: string;
  icon: string;
  route: string;
}

export interface DashboardActivity {
  model: string;
  field: string;
  old: string | null;
  new: string | null;
  user: string;
  timestamp: string;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  metrics: DashboardMetric[];
  appointments_this_week: WeeklyAppointment[];
  appointment_status_breakdown: AppointmentStatusBreakdown[];
  clinical_snapshot: ClinicalSnapshot;
  quick_links: DashboardQuickLink[];
  recent_activities: DashboardActivity[];
}
