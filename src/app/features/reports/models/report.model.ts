export interface ReportDocumentSummary {
  uuid: string;
  document_type?: string;
  document?: string | null;
  description?: string | null;
}

export interface ReportPrescriptionSummary {
  uuid: string;
  medication?: string | null;
  dosage?: string | null;
}

export interface ReportTreatmentPlanSummary {
  uuid: string;
  treatment_type?: string | null;
  status?: string | null;
}

export interface ReportRecord {
  uuid: string;
  consultation: string;
  consultation_number: string;
  report_type: string;
  prescription_summary?: ReportPrescriptionSummary | null;
  treatment_plan_summary?: ReportTreatmentPlanSummary | null;
  documents: ReportDocumentSummary[];
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReportPayload {
  consultation_id: string;
  report_type: string;
  prescription_summary_id?: string | null;
  treatment_plan_summary_id?: string | null;
  document_ids?: string[];
  notes?: string;
  is_active?: boolean;
}
