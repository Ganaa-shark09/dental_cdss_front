import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { CdssService } from '../services/cdss.service';
import { CdssEnginePrintData, MedicationItem, PerToothResult } from '../models/cdss-engine.model';

@Component({
  selector: 'app-cdss-print',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TagModule, ToastModule],
  templateUrl: './cdss-print.html',
  styleUrl: './cdss-print.scss',
})
export class CdssPrint implements OnInit {
  private readonly service = inject(CdssService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<CdssEnginePrintData | null>(null);
  loading = signal(false);

  readonly uuid = this.route.snapshot.paramMap.get('uuid')!;

  allMedications = computed((): Array<{ tooth: string; med: MedicationItem }> => {
    const d = this.data();
    if (!d?.per_tooth_results) return [];
    const meds: Array<{ tooth: string; med: MedicationItem }> = [];
    Object.entries(d.per_tooth_results).forEach(([tooth, result]) => {
      (result.medication || []).forEach((med) => meds.push({ tooth, med }));
    });
    return meds;
  });

  toothResults = computed((): Array<{ tooth: string; result: PerToothResult }> => {
    const d = this.data();
    if (!d?.per_tooth_results) return [];
    return Object.entries(d.per_tooth_results).map(([tooth, result]) => ({ tooth, result }));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getCdssEnginePrint(this.uuid).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Could not load CDSS print data.',
        });
      },
    });
  }

  print(): void {
    window.print();
  }

  back(): void {
    this.router.navigate(['/cdss', this.uuid]);
  }

  calculateAge(dob?: string): string {
    if (!dob) return '—';
    const birth = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    return `${age} yrs`;
  }

  today(): string {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  confidenceSeverity(score: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (score?.toUpperCase()) {
      case 'HIGH': return 'success';
      case 'MODERATE': return 'info';
      case 'LOW': return 'warn';
      default: return 'danger';
    }
  }
}
