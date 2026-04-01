import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cdss-new-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './cdss-new-button.html',
  styleUrl: './cdss-new-button.scss',
})
export class CdssNewButton {
  label = input('New');
  isDisabled = input(false);
  outlined = input(false);
  severity = input<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'
  >('primary');
}
