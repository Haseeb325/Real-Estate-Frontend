import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-white mb-4">Settings</h1>
      <p class="text-gray-400">Configure admin panel settings.</p>
    </div>
  `,
})
export class SettingsComponent {}
