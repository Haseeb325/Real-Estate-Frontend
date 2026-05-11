import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ADMIN_SIDEBAR_DATA } from '../../data/sidebar.data';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class AdminSidebarComponent {
  readonly menuSections = ADMIN_SIDEBAR_DATA;
}
