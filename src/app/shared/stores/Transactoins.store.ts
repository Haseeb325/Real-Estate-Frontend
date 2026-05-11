// import { Injectable, inject, signal } from "@angular/core";
// import { ApiService } from "../api.service";
// import { Payment, RentalAgreement } from "../../core/interfaces/payment";
// import { firstValueFrom } from "rxjs";
// import { URLConfig } from "../utils/url-config";

// @Injectable({
//     providedIn: 'root'
// })
// export class TransactionStore {

//     private apiService = inject(ApiService);

//     sales = signal<Payment[]>([]);
//     rentals = signal<RentalAgreement[]>([]);

//    async fetchSales(forceRefresh: boolean = false){
//         if(this.sales().length > 0 && !forceRefresh){
//             return;
//         }

//         try {

//             const res = await firstValueFrom(this.apiService.get(URLConfig.getSalesTransactions))
//             this.sales.set(res.data || [])

//         } catch (error) {

//         }

//     }

// }
