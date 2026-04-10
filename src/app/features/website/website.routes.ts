import { Routes } from "@angular/router";

export const websiteRoutes:Routes = [
    {
        path: '',
        loadComponent: () => import('./website').then(m =>m.Website),
        children:[
            {
                path:'',
                redirectTo:'landing',
                pathMatch:'full'
            },
            {
                path:'landing',
                loadComponent:() => import('./landing/landing').then(m => m.Landing)
            }
        ]
    },
]