import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { StaffService } from '../services/staff.service';
import { Staff } from '../models/staff.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-staff-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './staff-details.html',
  styleUrl: './staff-details.scss',
})
export class StaffDetails {
  private readonly staffService = inject(StaffService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid') || '';

  loading = signal(false);
  member = signal<Staff | null>(null);

  detailRows = computed<CdssDetailRow[]>(() => {
    const member = this.member();

    if (!member) {
      return [];
    }

    return [
      { label: 'First Name', value: member.employee_id, type: 'text', fullWidth: false },
      { label: 'Last Name', value: member.user_name, type: 'text', fullWidth: false },
      { label: 'Email', value: member.user_email || '—', type: 'text', fullWidth: false },
      {
        label: 'years of experience',
        value: member.years_of_experience,
        type: 'text',
        fullWidth: false,
      },
      { label: 'Role', value: member.role || '—', type: 'text', fullWidth: false },
      {
        label: 'Specialization',
        value: member.specialization || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Clinic',
        value: member.clinic_name || member.clinic || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Status',
        value: member.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: member.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
    ];
  });

  constructor() {
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading.set(true);

    this.staffService.getStaffMember(this.uuid).subscribe({
      next: (member) => {
        this.member.set(member);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load staff details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/staff']);
  }

  onEdit(): void {
    this.router.navigate(['/staff', this.uuid, 'edit']);
  }
}
