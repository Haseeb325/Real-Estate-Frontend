import { Component } from '@angular/core';
import { RentalAgreements } from '../../../shared/components/rental-agreements/rental-agreements';

@Component({
  selector: 'app-seller-payments',
  standalone: true,
  imports: [RentalAgreements],
  template: `
    <div class="bg-gray-950 p-6 md:p-10">
      <div class="mb-10">
        <h1 class="text-3xl font-black text-white mb-2">Financial Overview</h1>
        <p class="text-gray-500">Track your earnings, active rentals, and property sales.</p>
      </div>

      <app-rental-agreements></app-rental-agreements>
    </div>
  `,
})
export class SellerPayments {}
