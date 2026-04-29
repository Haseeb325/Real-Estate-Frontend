import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  tabs = [
    {
      label: 'Chats',
      icon: 'chat',
      routerLink: '.', // Use '.' for the default child path
      exact: true
    },
    {
      label: 'Appointments',
      icon: 'calendar',
      routerLink: 'appointments',
      exact: false
    },
    {
      label: 'Bookings',
      icon: 'building',
      routerLink: 'bookings',
      exact: false
    },
  ];
}
