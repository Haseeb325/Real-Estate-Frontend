import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { websiteRoutes } from './features/website/website.routes';

export const routes: Routes = [
...websiteRoutes,
    {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    }
];
