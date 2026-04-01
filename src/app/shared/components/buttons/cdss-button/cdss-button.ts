import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cdss-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './cdss-button.html',
  styleUrl: './cdss-button.scss',
})
export class CdssButton {
  @Input() label = 'Button';
  @Input() icon = '';
  @Input() severity:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'contrast' = 'primary';
  @Input() outlined = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<void>();
}
