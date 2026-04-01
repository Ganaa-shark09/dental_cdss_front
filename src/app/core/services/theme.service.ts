import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'app_theme';

  readonly currentTheme = signal<AppTheme>('light');

  initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey) as AppTheme | null;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.storageKey, theme);

    const root = this.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('app-dark');
      root.classList.remove('app-light');
    } else {
      root.classList.add('app-light');
      root.classList.remove('app-dark');
    }
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
