import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cdss-save-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './cdss-save-button.html',
  styleUrl: './cdss-save-button.scss',
})
export class CdssSaveButton {
  label = input('Save');
  isDisabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  severity = input<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'
  >('primary');
}
