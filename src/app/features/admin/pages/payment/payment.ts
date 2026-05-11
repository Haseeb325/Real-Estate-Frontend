import { Component, inject } from '@angular/core';
import { AdminStatsService } from '../../admin.stats';
import { CommonModule } from '@angular/common';
import { RentalAgreements } from '../../../../shared/components/rental-agreements/rental-agreements';
import { URLConfig } from '../../../../shared/utils/url-config';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, RentalAgreements],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment {
  adminService = inject(AdminStatsService);
  paymentStats = this.adminService.payments;
  isLoading = this.adminService.isLoading;
  error = this.adminService.error;

  paymentUrl = URLConfig.getSalesTransactions;
  rentalUrl = URLConfig.getRentalTransactions;

  ngOnInit(): void {
    if (!this.adminService.payments()) {
      this.adminService.getPaymentStats();
    }
  }
}
