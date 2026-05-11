import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="flex min-h-screen overflow-hidden bg-gray-900">
      <!-- Persistent Sidebar -->
      <app-admin-sidebar class="flex-shrink-0"></app-admin-sidebar>

      <!-- Main Dynamic Content -->
      <main class="flex-1 overflow-y-auto bg-gray-900">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {}
