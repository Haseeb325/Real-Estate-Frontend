import { Component } from '@angular/core';
import { RentalAgreements } from '../../../../shared/components/rental-agreements/rental-agreements';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [RentalAgreements],
  template: `
    <div class="bg-gray-950  p-4 md:p-8">
      <app-rental-agreements></app-rental-agreements>
    </div>
  `,
})
export class Bookings {}
