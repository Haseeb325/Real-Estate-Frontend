// import { inject, Injectable } from "@angular/core";
// import { AuthStore } from "../../shared/authStore";
// import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";

// @Injectable({
//     providedIn:'root'
// })

// export class RoleGuard {

//     authStore = inject(AuthStore)
//     router:Router = inject(Router)

//     canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):boolean{

//         // basic for single auth checking
//         // const isAuthenticated = this.authStore.isAuthenticated()
//         // if(!isAuthenticated){
//         //     this.router.navigate(['/sign-in'])
//         //     return false
//         // }

//         // return true

//         // role based auth checking
//         const user = this.authStore.user()
//         const allowedRoles = route.data['roles']

//         if(!user){
//             this.router.navigate(['/sign-in'])
//             return false
//         }

//         if(allowedRoles && allowedRoles?.includes(user.role)){
//             return true
//         }
//         this.router.navigate(['/sign-in'])
//         return false
    

//     }

// }



// // // usage example
// // // {
// // //   path: 'admin',
// // //   component: AdminComponent,
// // //   canActivate: [AuthGuard, RoleGuard], // AuthGuard for login, RoleGuard for permissions
// // //   data: { roles: ['admin'] }
// // // },
// // // {
// // //   path: 'seller',
// // //   component: SellerComponent,
// // //   canActivate: [AuthGuard, RoleGuard],
// // //   data: { roles: ['seller', 'admin'] } // admin can also access
// // // },
// // // {
// // //   path: 'buyer',
// // //   component: BuyerComponent,
// // //   canActivate: [AuthGuard, RoleGuard],
// // //   data: { roles: ['buyer'] }
// // // }
