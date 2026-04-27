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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<PrescriptionPrintData | null>(null);
  loading = signal(false);

  readonly uuid = this.route.snapshot.paramMap.get('uuid')!;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getPrescriptionPrint(this.uuid).subscribe({
      next: (data) => {
        this.data.set(data);
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
