import { Routes } from '@angular/router';

export const sellerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./seller').then((m) => m.Seller),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./seller-dashboard/seller-dashboard').then((m) => m.SellerDashboard),
      },
      {
        path: 'create-listing',
        loadComponent: () =>
          import('./create-property/create-property').then((m) => m.CreateProperty),
      },
      {
        path: 'property/:id',
        loadComponent: () =>
          import('./property-detail/property-detail').then((m) => m.PropertyDetail),
      },
      {
        path: 'edit-property/:id',
        loadComponent: () =>
          import('./create-property/create-property').then((m) => m.CreateProperty),
      },
      {
        path: 'chats',
        loadComponent: () => import('./chats/chats').then((m) => m.Chats),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('../../shared/components/appointments/appointments').then((m) => m.Appointments),
      },
      {
        path: 'payments',
        loadComponent: () => import('./payments/payments').then((m) => m.SellerPayments),
      },
    ],
  },
];
