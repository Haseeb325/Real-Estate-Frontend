import { Routes } from '@angular/router';
import { websiteRoutes } from './features/website/website.routes';
import { AuthGuard, RoleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
...websiteRoutes,
    {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'seller',
        loadChildren:()=> import('./features/seller/seller.routes').then(m => m.sellerRoutes),
        canActivate:[AuthGuard, RoleGuard],
        data:{roles:['seller']} 
    }
];
