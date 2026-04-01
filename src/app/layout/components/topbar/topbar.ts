import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly user = this.authService.getCurrentUser();

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
