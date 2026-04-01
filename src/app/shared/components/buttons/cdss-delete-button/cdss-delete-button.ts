import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cdss-delete-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './cdss-delete-button.html',
  styleUrl: './cdss-delete-button.scss',
})
export class CdssDeleteButton {
  label = input('Delete');
  isDisabled = input(false);
  text = input(true);
  rounded = input(true);
  severity = input<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'
  >('danger');
  size = input<'small' | 'large' | undefined>(undefined);
}
