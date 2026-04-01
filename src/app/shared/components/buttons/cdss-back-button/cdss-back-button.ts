import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cdss-back-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './cdss-back-button.html',
  styleUrl: './cdss-back-button.scss',
})
export class CdssBackButton {
  label = input('Back');
  isDisabled = input(false);
  outlined = input(true);
  severity = input<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'
  >('secondary');
}
