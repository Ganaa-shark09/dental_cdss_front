// src/app/shared/layout/sidebar/sidebar-state.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarStateService {
  readonly collapsed = signal(false);

  toggle(): void {
    this.collapsed.update((value) => !value);
  }

  open(): void {
    this.collapsed.set(false);
  }

  close(): void {
    this.collapsed.set(true);
  }
}
