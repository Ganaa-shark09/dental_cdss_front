import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';

import { PrescriptionsService } from '../services/prescriptions.service';
import { PrescriptionPrintData } from '../models/prescription.model';
import { CdssService } from '../../cdss/services/cdss.service';
import { CdssEnginePrintData, CdssRecommendationRow } from '../../cdss/models/cdss-engine.model';

@Component({
  selector: 'app-prescriptions-print',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    DividerModule,
  ],
  templateUrl: './prescriptions-print.html',
  styleUrl: './prescriptions-print.scss',
})
export class PrescriptionsPrint implements OnInit {
  private readonly service = inject(PrescriptionsService);
  private readonly cdssService = inject(CdssService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<PrescriptionPrintData | null>(null);
  loading = signal(false);
  cdssData = signal<CdssEnginePrintData | null>(null);
  cdssRecommendations = signal<CdssRecommendationRow[] | null>(null);

  readonly uuid = this.route.snapshot.paramMap.get('uuid')!;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getPrescriptionPrint(this.uuid).subscribe({
      next: (data) => {
        // Map backend response to expected frontend model
        const mapped = this.mapResponseToPrintData(data);
        this.data.set(mapped);
        // Fetch all CDSS engines and filter for matching consultation number
        if (mapped.consultation_number) {
          this.cdssService.getCdssEngines().subscribe({
            next: (engines) => {
              const match = engines.find(e => e.consultation_number === mapped.consultation_number);
              if (match) {
                this.cdssService.getCdssEnginePrint(match.uuid).subscribe({
                  next: (cdss) => {
                    this.cdssData.set(cdss);
                  },
                  error: () => {
                    this.cdssData.set(null);
                  },
                });
                // Fetch recommendations for this CDSS engine
                this.cdssService.getCdssRecommendations(match.uuid).subscribe({
                  next: (recs) => {
                    this.cdssRecommendations.set(recs);
                  },
                  error: () => {
                    this.cdssRecommendations.set(null);
                  },
                });
              } else {
                this.cdssData.set(null);
                this.cdssRecommendations.set(null);
              }
            },
            error: () => {
              this.cdssData.set(null);
            },
          });
        } else {
          this.cdssData.set(null);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Could not load prescription print data.',
        });
      },
    });
  }

  private mapResponseToPrintData(resp: any): PrescriptionPrintData {
    return {
      uuid: resp.uuid,
      clinic: {
        uuid: resp.uuid,
        name: resp.clinic_name || '',
        address: resp.clinic_address || '',
        phone: resp.clinic_phone || '',
      },
      doctor: {
        uuid: resp.uuid,
        name: resp.doctor_name || '—',
        designation: resp.doctor_designation || '',
        license_number: resp.doctor_license || '',
      },
      patient: {
        uuid: resp.uuid,
        full_name: resp.patient_name || '',
        code: resp.patient_code || '',
        gender: resp.patient_gender || '',
        date_of_birth: resp.patient_date_of_birth || '',
        phone: resp.patient_phone || '',
      },
      date_issued: resp.date_issued || '',
      consultation_number: resp.consultation_number || '',
      chief_complaint: resp.chief_complaint || '',
      provisional_diagnosis: resp.provisional_diagnosis || '',
      final_diagnosis: resp.final_diagnosis || '',
      medication: resp.medication || '',
      dosage: resp.dosage || '',
      frequency: resp.frequency || '',
      duration: resp.duration || '',
      treatment_instructions: resp.treatment_instructions || '',
      notes: resp.notes || '',
    };
  }

  print(): void {
    window.print();
  }

  back(): void {
    this.router.navigate(['/prescriptions', this.uuid]);
  }

  today(): string {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  calculateAge(dob?: string): string {
    if (!dob) return '—';
    const birth = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    return `${age} years`;
  }
}
