import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROUTES } from '../../../core/constants/route.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', route: `/${ROUTES.app.dashboard}` },
    { label: 'Users', icon: 'pi pi-users', route: `/${ROUTES.app.users}` },
    { label: 'Clinics', icon: 'pi pi-building', route: `/${ROUTES.app.clinics}` },
    { label: 'Staff', icon: 'pi pi-id-card', route: `/${ROUTES.app.staff}` },
    { label: 'Patients', icon: 'pi pi-user', route: `/${ROUTES.app.patients}` },
    { label: 'Appointments', icon: 'pi pi-calendar', route: `/${ROUTES.app.appointments}` },
    { label: 'Consultations', icon: 'pi pi-file-edit', route: `/${ROUTES.app.consultations}` },
    { label: 'Odontology', icon: 'pi pi-sitemap', route: `/${ROUTES.app.odontology}` },
    { label: 'CDSS', icon: 'pi pi-sparkles', route: `/${ROUTES.app.cdss}` },
    { label: 'Prescriptions', icon: 'pi pi-clipboard', route: `/${ROUTES.app.prescriptions}` },
    { label: 'Documents', icon: 'pi pi-folder', route: `/${ROUTES.app.documents}` },
    { label: 'Reports', icon: 'pi pi-chart-bar', route: `/${ROUTES.app.reports}` },
    { label: 'Treatment Plans', icon: 'pi pi-briefcase', route: `/${ROUTES.app.treatmentPlans}` },
    { label: 'Audit Logs', icon: 'pi pi-history', route: `/${ROUTES.app.auditLogs}` },
  ];
}
