import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Staff, StaffListResponse } from '../models/staff.model';

export interface StaffQueryParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface StaffPayload {
  user: string;
  designation: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  specialization?: string;
  clinic?: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'staff/';

  getStaff(params?: StaffQueryParams): Observable<Staff[] | StaffListResponse> {
    return this.api.get<Staff[] | StaffListResponse>(
      this.endpoint,
      params as Record<string, string | number | boolean>,
    );
  }

  getStaffMember(uuid: string): Observable<Staff> {
    return this.api.get<Staff>(`${this.endpoint}${uuid}/`);
  }

  createStaff(payload: StaffPayload): Observable<Staff> {
    return this.api.post<Staff>(this.endpoint, payload);
  }

  updateStaff(uuid: string, payload: StaffPayload): Observable<Staff> {
    return this.api.put<Staff>(`${this.endpoint}${uuid}/`, payload);
  }

  deleteStaff(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
