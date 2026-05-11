import { Component } from '@angular/core';
import { RentalAgreements } from '../../../../shared/components/rental-agreements/rental-agreements';
import { URLConfig } from '../../../../shared/utils/url-config';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [RentalAgreements],
  template: `
    <div class="bg-gray-950 p-4 md:p-8">
      <app-rental-agreements
        [PaymentUrl]="paymentUrl"
        [RentalPaymentUrl]="rentalUrl"
      ></app-rental-agreements>
    </div>
  `,
})
export class Bookings {
  paymentUrl = URLConfig.paymentHistory;
  rentalUrl = URLConfig.rentalAgreements;
}
