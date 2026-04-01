import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
