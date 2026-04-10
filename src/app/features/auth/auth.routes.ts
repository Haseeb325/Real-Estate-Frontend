import { Routes } from "@angular/router";

export const authRoutes:Routes = [
{
    path: '',
    loadComponent:() => import('./auth').then(m => m.Auth),
    children:[
        {
            path:'',
            redirectTo:'sign-in',
            pathMatch:'full'    
        },
        {
         path:'sign-in',
         loadComponent:() => import('./sign-in/sign-in').then(m => m.SignIn)   
        },
        {
            path:'reg-step-1',
            loadComponent:() => import('./reg-step-1/reg-step-1').then(m => m.RegStep1)
        },
        {
            path:'reg-step-2',
            loadComponent:() => import('./reg-step-2/reg-step-2').then(m => m.RegStep2)
        },
        {
            path:'reg-step-3',
            loadComponent:() => import('./reg-step-3/reg-step-3').then((m)=>m.RegStep3)
        },
        {
            path:'reg-step-4',
            loadComponent:() => import('./reg-step-4/reg-step-4').then((m)=>m.RegStep4)
        },
        {
            path:'reset-password',
            async loadComponent() {
                const m = await import('./reset-password/reset-password');
                return m.ResetPassword;
            },
        },
        {
            path:'forgot-password',
            loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword)
        }

    ]
}
]