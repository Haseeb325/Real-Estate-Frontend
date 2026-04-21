import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from '../../core/guards/auth.guard';

export const websiteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./website').then((m) => m.Website),
    children: [
      {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full',
      },
      {
        path: 'landing',
        loadComponent: () => import('./landing/landing').then((m) => m.Landing),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./property-detail/property-detail').then((m) => m.PropertyDetail),
      },
      {
        path: 'property-booking/:property_type/:purchase_type/:id',
        loadComponent: () =>
          import('./property-booking/property-booking').then((m) => m.PropertyBooking),
        canActivate: [AuthGuard, RoleGuard],
        data: {
          roles: 'buyer',
        },
      },
    ],
  },
];
