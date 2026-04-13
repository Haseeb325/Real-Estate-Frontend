// import { inject, Injectable } from "@angular/core";
// import { AuthStore } from "../../shared/authStore";
// import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";

// @Injectable({
//     providedIn:'root'
// })

// export class AuthGuard {

//     authStore = inject(AuthStore)
//     router:Router = inject(Router)

//     canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):boolean{

//         // basic for single auth checking
//         const isAuthenticated = this.authStore.isAuthenticated()
//         if(!isAuthenticated){
//             this.router.navigate(['/sign-in'])
//             return false
//         }

//         return true

      
    

//     }

// }




import { inject, Inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthStore } from "../../shared/authStore";

export const AuthGuard:CanActivateFn = (route, state)=>{
    const router = inject(Router)
    const authStore = inject(AuthStore)

    if(!authStore.isAuthenticated()){
        router.navigate(['/sign-in'])
        return false
    }
    return true

}


export const RoleGuard:CanActivateFn=(route, state)=>{
    const router = inject(Router)
    const authStore = inject(AuthStore)
    const user = authStore.user()
    const allowedRoles = route.data['roles'] as string[];

    if(!user){
        router.navigate(['/sign-in'])
        return false
    
    }
    if(allowedRoles && allowedRoles?.includes(user.role)) return true
     
    router.navigate(['/sign-in'])
    return false
    

}





// { 
//   path: 'admin', 
//   component: AdminComponent, 
//   canActivate: [authGuard, roleGuard], 
//   data: { roles: ['admin'] } 
// }