import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then((m) => m.UsersComponent),
      },
      {
        path: 'listings',
        loadComponent: () => import('./pages/listings/listings').then((m) => m.ListingsComponent),
      },
      {
        path: 'listings/:id',
        loadComponent: () =>
          import('./pages/listings/property-view/property-view').then(
            (m) => m.AdminPropertyViewComponent
          ),
      },
      {
        path: 'verifications',
        loadComponent: () =>
          import('./pages/verifications/verifications').then((m) => m.VerificationsComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsComponent),
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/payment/payment').then((m) => m.Payment),
      },
    ],
  },
];
