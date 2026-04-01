import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [],
  template: `
    <div>
      <h2>Login</h2>
      <p>Auth screen placeholder</p>
      <i class="pi pi-check"></i>
      <i class="pi pi-user"></i>
      <i class="pi pi-spin pi-spinner"></i>
      <div class="bg-blue-500 text-white p-4 rounded-lg">Tailwind is working 🎉</div>
    </div>
  `,
  styleUrl: './layout.scss',
})
export class Layout {}
