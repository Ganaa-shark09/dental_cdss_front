export interface AuditLogUser {
  id: number;
  uuid?: string | null;
  email?: string | null;
  full_name?: string | null;
}

export interface AuditLogRecord {
  uuid: string;
  model_name: string;
  record_id: string;
  field_name: string;
  old_value?: string | null;
  new_value?: string | null;
  user?: AuditLogUser | null;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}
