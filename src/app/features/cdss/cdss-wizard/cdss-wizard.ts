import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CdssService } from '../services/cdss.service';
import { ConsultationsService } from '../../consultations/services/consultations.service';
import { OdontologyService } from '../../odontology/services/odontology.service';
import { PrescriptionsService } from '../../prescriptions/services/prescriptions.service';
import { CdssSchema, ComplaintCode, ExamField } from '../models/cdss-schema.model';
import { CdssEngine, PerToothResult, MedicationItem } from '../models/cdss-engine.model';
import { Consultation, ToothComplaintCode } from '../../consultations/models/consultation.model';
import { DentalChart, ToothRecord } from '../../odontology/models/odontology.model';

interface ToothComplaintState {
  complaint_codes: ToothComplaintCode[];
  duration: string;
  severity: string;
}

interface ExamDataState {
  [field: string]: string | boolean | number;
}

@Component({
  selector: 'app-cdss-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    DividerModule,
    BadgeModule,
  ],
  templateUrl: './cdss-wizard.html',
  styleUrl: './cdss-wizard.scss',
})
export class CdssWizard implements OnInit {
  private readonly cdssService = inject(CdssService);
  private readonly consultationsService = inject(ConsultationsService);
  private readonly odontologyService = inject(OdontologyService);
  private readonly prescriptionsService = inject(PrescriptionsService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  // Wizard state
  currentStep = signal(0);
  loading = signal(false);
  saving = signal(false);

  // Schema
  schema = signal<CdssSchema | null>(null);
  schemaLoading = signal(false);

  // Step 1: Consultation
  consultations = signal<Consultation[]>([]);
  consultationsLoading = signal(false);
  selectedConsultationId = signal<string>('');
  selectedConsultation = signal<Consultation | null>(null);

  // Step 2: Medical history
  selectedSystemicConditions = signal<string[]>([]);
  selectedHabits = signal<string[]>([]);
  selectedAllergies = signal<string[]>([]);
  selectedPastDentalHistory = signal<string[]>([]);

  // Step 3: Tooth complaints
  selectedTeeth = signal<string[]>([]);
  toothComplaints = signal<Record<string, ToothComplaintState>>({});
  activeToothTab = signal<string>('');

  // Step 4: Examination
  dentalChart = signal<DentalChart | null>(null);
  toothRecords = signal<Record<string, ToothRecord>>({});
  examData = signal<Record<string, ExamDataState>>({});

  // Step 5 / 6: Analysis
  analyzing = signal(false);
  cdssEngine = signal<CdssEngine | null>(null);

  // Step 7: Print
  creatingPrescription = signal(false);
  prescriptionCreated = signal(false);
  prescriptionUuid = signal<string>('');

  // FDI Tooth chart layout
  readonly upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
  readonly upperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'];
  readonly lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'];
  readonly lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];

  readonly STEPS = [
    { label: 'Consultation', icon: 'pi pi-file' },
    { label: 'Medical History', icon: 'pi pi-heart' },
    { label: 'Chief Complaint', icon: 'pi pi-comment' },
    { label: 'Examination', icon: 'pi pi-search' },
    { label: 'Analysis', icon: 'pi pi-cpu' },
    { label: 'Results', icon: 'pi pi-chart-bar' },
    { label: 'Print', icon: 'pi pi-print' },
  ];

  // Computed: departments used across all tooth complaints
  activeDepartments = computed(() => {
    const depts = new Set<string>();
    const complaints = this.toothComplaints();
    Object.values(complaints).forEach((tc) => {
      tc.complaint_codes.forEach((cc) => depts.add(cc.department));
    });
    return Array.from(depts);
  });

  // Computed: departments per tooth
  departmentsForTooth(toothNum: string): string[] {
    const tc = this.toothComplaints()[toothNum];
    if (!tc) return [];
    const depts = new Set<string>(tc.complaint_codes.map((c) => c.department));
    return Array.from(depts);
  }

  // Computed: exam fields for a tooth
  examFieldsForTooth(toothNum: string): ExamField[] {
    const schema = this.schema();
    if (!schema) return [];
    const depts = this.departmentsForTooth(toothNum);
    const fields: ExamField[] = [];
    const seen = new Set<string>();
    depts.forEach((dept) => {
      const deptFields = schema.section3_examination[dept] || [];
      deptFields.forEach((f) => {
        if (!seen.has(f.key)) {
          seen.add(f.key);
          fields.push(f);
        }
      });
    });
    return fields;
  }

  // Computed: tooth results from CDSS engine
  toothResultEntries = computed((): Array<{ tooth: string; result: PerToothResult }> => {
    const engine = this.cdssEngine();
    if (!engine?.per_tooth_results) return [];
    return Object.entries(engine.per_tooth_results).map(([tooth, result]) => ({ tooth, result }));
  });

  // Computed: all medications across results
  allMedications = computed((): Array<{ tooth: string; med: MedicationItem }> => {
    const entries = this.toothResultEntries();
    const meds: Array<{ tooth: string; med: MedicationItem }> = [];
    entries.forEach(({ tooth, result }) => {
      (result.medication || []).forEach((med) => meds.push({ tooth, med }));
    });
    return meds;
  });

  // Consultation dropdown options
  consultationOptions = computed(() =>
    this.consultations().map((c) => ({
      label: `${c.consultation_number || c.uuid} — ${c.patient_name || ''}`.trim(),
      value: c.uuid,
    })),
  );

  ngOnInit(): void {
    this.loadSchema();
    this.loadConsultations();
  }

  loadSchema(): void {
    this.schemaLoading.set(true);
    this.cdssService.getSchema().subscribe({
      next: (schema) => {
        this.schema.set(schema);
        this.schemaLoading.set(false);
      },
      error: () => {
        this.schemaLoading.set(false);
        this.messageService.add({ severity: 'warn', summary: 'Schema', detail: 'Could not load schema choices.' });
      },
    });
  }

  loadConsultations(): void {
    this.consultationsLoading.set(true);
    this.consultationsService.getConsultations().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res.results ?? []);
        this.consultations.set(list);
        this.consultationsLoading.set(false);
      },
      error: () => {
        this.consultationsLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load consultations.' });
      },
    });
  }

  // Navigation
  canGoNext = computed(() => {
    switch (this.currentStep()) {
      case 0: return !!this.selectedConsultationId();
      case 1: return true; // medical history is optional
      case 2: return this.selectedTeeth().length > 0;
      case 3: return true; // exam is optional
      case 4: return !!this.cdssEngine();
      case 5: return !!this.cdssEngine();
      default: return false;
    }
  });

  canGoPrev = computed(() => this.currentStep() > 0);

  goNext(): void {
    if (this.currentStep() < this.STEPS.length - 1) {
      this.saveCurrentStep();
    }
  }

  goPrev(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((s) => s - 1);
    }
  }

  goToStep(index: number): void {
    if (index <= this.currentStep()) {
      this.currentStep.set(index);
    }
  }

  private saveCurrentStep(): void {
    switch (this.currentStep()) {
      case 0: this.saveStep1(); break;
      case 1: this.saveStep2(); break;
      case 2: this.saveStep3(); break;
      case 3: this.saveStep4(); break;
      case 4: this.saveStep5(); break;
      case 5: this.currentStep.update((s) => s + 1); break;
      default: this.currentStep.update((s) => s + 1);
    }
  }

  // Step 1: select consultation and load it
  onConsultationChange(uuid: string): void {
    this.selectedConsultationId.set(uuid);
    const c = this.consultations().find((c) => c.uuid === uuid);
    if (c) this.selectedConsultation.set(c);
  }

  saveStep1(): void {
    const uuid = this.selectedConsultationId();
    if (!uuid) return;
    this.loading.set(true);
    this.consultationsService.getConsultation(uuid).subscribe({
      next: (c) => {
        this.selectedConsultation.set(c);
        // Pre-fill medical history if already set
        if (c.systemic_conditions?.length) this.selectedSystemicConditions.set(c.systemic_conditions);
        if (c.habits?.length) this.selectedHabits.set(c.habits);
        if (c.allergies?.length) this.selectedAllergies.set(c.allergies);
        if (c.past_dental_history?.length) this.selectedPastDentalHistory.set(c.past_dental_history);
        this.loading.set(false);
        this.currentStep.update((s) => s + 1);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load consultation.' });
      },
    });
  }

  // Step 2: save medical history
  saveStep2(): void {
    const uuid = this.selectedConsultationId();
    if (!uuid) return;
    this.saving.set(true);
    this.consultationsService.patchConsultation(uuid, {
      systemic_conditions: this.selectedSystemicConditions(),
      habits: this.selectedHabits(),
      allergies: this.selectedAllergies(),
      past_dental_history: this.selectedPastDentalHistory(),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.currentStep.update((s) => s + 1);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save failed', detail: 'Could not save medical history.' });
      },
    });
  }

  // Step 3: tooth complaints
  toggleTooth(tooth: string): void {
    const current = this.selectedTeeth();
    if (current.includes(tooth)) {
      this.selectedTeeth.set(current.filter((t) => t !== tooth));
      const complaints = { ...this.toothComplaints() };
      delete complaints[tooth];
      this.toothComplaints.set(complaints);
      if (this.activeToothTab() === tooth) {
        this.activeToothTab.set(this.selectedTeeth()[0] || '');
      }
    } else {
      this.selectedTeeth.set([...current, tooth].sort());
      const complaints = { ...this.toothComplaints() };
      if (!complaints[tooth]) {
        complaints[tooth] = { complaint_codes: [], duration: '', severity: '' };
      }
      this.toothComplaints.set(complaints);
      this.activeToothTab.set(tooth);
    }
  }

  isToothSelected(tooth: string): boolean {
    return this.selectedTeeth().includes(tooth);
  }

  setActiveToothTab(tooth: string): void {
    this.activeToothTab.set(tooth);
  }

  toggleComplaint(toothNum: string, code: ComplaintCode, department: string): void {
    const complaints = { ...this.toothComplaints() };
    const tc = complaints[toothNum] || { complaint_codes: [], duration: '', severity: '' };
    const existing = tc.complaint_codes.findIndex((c) => c.code === code.code);
    if (existing >= 0) {
      tc.complaint_codes = tc.complaint_codes.filter((c) => c.code !== code.code);
    } else {
      tc.complaint_codes = [...tc.complaint_codes, { code: code.code, complaint: code.label, department }];
    }
    complaints[toothNum] = tc;
    this.toothComplaints.set(complaints);
  }

  isComplaintSelected(toothNum: string, code: string): boolean {
    return (this.toothComplaints()[toothNum]?.complaint_codes || []).some((c) => c.code === code);
  }

  setToothDuration(toothNum: string, value: string): void {
    const complaints = { ...this.toothComplaints() };
    if (complaints[toothNum]) complaints[toothNum] = { ...complaints[toothNum], duration: value };
    this.toothComplaints.set(complaints);
  }

  setToothSeverity(toothNum: string, value: string): void {
    const complaints = { ...this.toothComplaints() };
    if (complaints[toothNum]) complaints[toothNum] = { ...complaints[toothNum], severity: value };
    this.toothComplaints.set(complaints);
  }

  saveStep3(): void {
    const uuid = this.selectedConsultationId();
    if (!uuid) return;
    const teeth = Object.entries(this.toothComplaints())
      .filter(([, tc]) => tc.complaint_codes.length > 0)
      .map(([tooth_number, tc]) => ({
        tooth_number,
        complaint_codes: tc.complaint_codes,
        duration: tc.duration,
        severity: tc.severity,
      }));

    if (teeth.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please add complaints for at least one tooth.' });
      return;
    }

    this.saving.set(true);
    this.consultationsService.createToothComplaintBulk(uuid, { teeth }).subscribe({
      next: () => {
        this.saving.set(false);
        // Now try to load/create dental chart
        this.loadOrCreateDentalChart(uuid);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save failed', detail: 'Could not save tooth complaints.' });
      },
    });
  }

  private loadOrCreateDentalChart(consultationUuid: string): void {
    // Try to get existing chart for this consultation
    this.odontologyService.getCharts().pipe(
      switchMap((charts: DentalChart[]) => {
        const existing = charts.find((c) => c.consultation === consultationUuid);
        if (existing) {
          return of(existing);
        }
        // Create new chart
        return this.odontologyService.createChart({ consultation_id: consultationUuid });
      }),
    ).subscribe({
      next: (chart) => {
        this.dentalChart.set(chart);
        // Map existing tooth records
        const recordMap: Record<string, ToothRecord> = {};
        (chart.tooth_records || []).forEach((tr) => (recordMap[tr.tooth_number] = tr));
        this.toothRecords.set(recordMap);
        // Pre-fill exam data from existing records
        const examMap: Record<string, ExamDataState> = {};
        (chart.tooth_records || []).forEach((tr) => {
          if (tr.exam_data) examMap[tr.tooth_number] = { ...tr.exam_data };
        });
        this.examData.set(examMap);
        this.currentStep.update((s) => s + 1);
      },
      error: () => {
        // Proceed to exam step even if chart creation fails
        this.currentStep.update((s) => s + 1);
        this.messageService.add({ severity: 'warn', summary: 'Note', detail: 'Could not load dental chart. Exam data may not be saved.' });
      },
    });
  }

  // Step 4: examination - set exam field value
  setExamField(toothNum: string, fieldKey: string, value: string | boolean): void {
    const current = { ...this.examData() };
    current[toothNum] = { ...(current[toothNum] || {}), [fieldKey]: value };
    this.examData.set(current);
  }

  getExamField(toothNum: string, fieldKey: string): string | boolean {
    const val = this.examData()[toothNum]?.[fieldKey];
    if (typeof val === 'number') return String(val);
    return (val as string | boolean | undefined) ?? '';
  }

  saveStep4(): void {
    const chart = this.dentalChart();
    const selectedTeeth = this.selectedTeeth();
    if (!chart || selectedTeeth.length === 0) {
      this.currentStep.update((s) => s + 1);
      return;
    }

    this.saving.set(true);
    const records = this.toothRecords();
    const examMap = this.examData();

    // Create/update tooth records for each tooth with exam data
    const ops = selectedTeeth.map((tooth) => {
      const examFields = this.examFieldsForTooth(tooth);
      if (examFields.length === 0) return of(null);

      const examDataForTooth = examMap[tooth] || {};
      const existingRecord = records[tooth];

      if (existingRecord) {
        return this.odontologyService.patchToothRecord(chart.uuid, existingRecord.uuid, {
          exam_data: examDataForTooth,
        });
      } else {
        return this.odontologyService.createToothRecord(chart.uuid, {
          tooth_number: tooth,
          condition: 'CARIES',
          exam_data: examDataForTooth,
        }).pipe(catchError(() => of(null)));
      }
    });

    forkJoin(ops).subscribe({
      next: () => {
        this.saving.set(false);
        this.currentStep.update((s) => s + 1);
      },
      error: () => {
        this.saving.set(false);
        this.currentStep.update((s) => s + 1);
        this.messageService.add({ severity: 'warn', summary: 'Note', detail: 'Some exam data could not be saved but analysis will proceed.' });
      },
    });
  }

  // Step 5: run analysis
  saveStep5(): void {
    this.runAnalysis();
  }

  runAnalysis(): void {
    const uuid = this.selectedConsultationId();
    if (!uuid) return;
    this.analyzing.set(true);
    this.cdssService.analyzeConsultation({ consultation_id: uuid }).subscribe({
      next: (engine) => {
        this.cdssEngine.set(engine);
        this.analyzing.set(false);
        this.currentStep.update((s) => s + 1);
      },
      error: () => {
        this.analyzing.set(false);
        this.messageService.add({ severity: 'error', summary: 'Analysis failed', detail: 'CDSS analysis could not be completed.' });
      },
    });
  }

  // Step 6 → 7
  proceedToPrint(): void {
    this.currentStep.update((s) => s + 1);
  }

  // Chip toggle helpers for medical history
  toggleChip(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  }

  toggleSystemicCondition(item: string): void {
    this.selectedSystemicConditions.update((l) => this.toggleChip(l, item));
  }

  toggleHabit(item: string): void {
    this.selectedHabits.update((l) => this.toggleChip(l, item));
  }

  toggleAllergy(item: string): void {
    this.selectedAllergies.update((l) => this.toggleChip(l, item));
  }

  togglePastDental(item: string): void {
    this.selectedPastDentalHistory.update((l) => this.toggleChip(l, item));
  }

  // Create prescription from CDSS results
  createPrescriptionFromResults(): void {
    const engine = this.cdssEngine();
    const consultation = this.selectedConsultation();
    if (!engine || !consultation) return;

    const meds = this.allMedications();
    if (meds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No medications', detail: 'No medications found in CDSS results.' });
      return;
    }

    const medicationText = meds.map((m) =>
      `${m.med.name} — ${m.med.dosage}, ${m.med.frequency}, ${m.med.duration}${m.med.note ? ' (' + m.med.note + ')' : ''}`
    ).join('\n');

    const treatmentText = this.toothResultEntries()
      .map(({ tooth, result }) => `Tooth ${tooth}: ${(result.treatment || []).join(', ')}`)
      .join('\n');

    this.creatingPrescription.set(true);
    this.prescriptionsService.createPrescription({
      patient_id: consultation.patient || '',
      consultation_id: consultation.uuid,
      date_issued: new Date().toISOString().split('T')[0],
      medication: medicationText,
      dosage: meds[0]?.med.dosage || '',
      frequency: meds[0]?.med.frequency || '',
      duration: meds[0]?.med.duration || '',
      treatment_instructions: treatmentText,
    }).subscribe({
      next: (rx) => {
        this.creatingPrescription.set(false);
        this.prescriptionCreated.set(true);
        this.prescriptionUuid.set(rx.uuid);
        this.messageService.add({ severity: 'success', summary: 'Prescription created', detail: 'Prescription saved successfully.' });
      },
      error: () => {
        this.creatingPrescription.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not create prescription.' });
      },
    });
  }

  printPage(): void {
    const engine = this.cdssEngine();
    if (engine) {
      this.router.navigate(['/cdss', engine.uuid, 'print']);
    }
  }

  viewPrescription(): void {
    const uuid = this.prescriptionUuid();
    if (uuid) this.router.navigate(['/prescriptions', uuid]);
  }

  viewCdssDetails(): void {
    const engine = this.cdssEngine();
    if (engine) this.router.navigate(['/cdss', engine.uuid]);
  }

  nextStep(): void {
    this.currentStep.update((s) => s + 1);
  }

  goBack(): void {
    this.router.navigate(['/cdss']);
  }

  // Helpers for template
  getConfidenceClass(confidence: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (confidence?.toUpperCase()) {
      case 'HIGH': return 'success';
      case 'MODERATE': return 'info';
      case 'LOW': return 'warn';
      default: return 'danger';
    }
  }

  getToothComplaintSummary(tooth: string): string {
    const tc = this.toothComplaints()[tooth];
    if (!tc) return '';
    return tc.complaint_codes.map((c) => c.complaint).join(', ');
  }

  departmentLabel(dept: string): string {
    const map: Record<string, string> = {
      ENDO: 'Endodontics',
      CONSERVATIVE: 'Conservative',
      PERIO: 'Periodontics',
      ORAL_MED: 'Oral Medicine',
      ORAL_SURGERY: 'Oral Surgery',
      PROSTHODONTICS: 'Prosthodontics',
      ORTHODONTICS: 'Orthodontics',
      PEDODONTICS: 'Pedodontics',
      IMPLANTOLOGY: 'Implantology',
    };
    return map[dept] || dept;
  }

  sectionComplaintsEntries(): Array<{ dept: string; codes: ComplaintCode[] }> {
    const schema = this.schema();
    if (!schema) return [];
    return Object.entries(schema.section2_complaints).map(([dept, codes]) => ({ dept, codes }));
  }

  today(): string {
    return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
