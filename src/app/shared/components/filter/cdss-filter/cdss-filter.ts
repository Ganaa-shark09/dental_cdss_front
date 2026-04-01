import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CdssButton } from '../../buttons/cdss-button/cdss-button';

@Component({
  selector: 'app-cdss-filter',
  standalone: true,
  imports: [FormsModule, InputTextModule, CdssButton],
  templateUrl: './cdss-filter.html',
  styleUrl: './cdss-filter.scss',
})
export class CdssFilter {
  search = '';

  @Output() searchChange = new EventEmitter<string>();

  applyFilter(): void {
    this.searchChange.emit(this.search);
  }
}
