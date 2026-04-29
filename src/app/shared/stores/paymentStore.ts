import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { URLConfig } from '../utils/url-config';
import { Payment, RentalAgreement } from '../../core/interfaces/payment';
import { ToastService } from '../../core/services/toast.service';
import { finalize, lastValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentStore {
  private apiService = inject(ApiService);
  public toastService = inject(ToastService);

  // State
  agreements = signal<RentalAgreement[]>([]);
  payments = signal<Payment[]>([]);
  isLoading = signal<boolean>(false);

  // Computed
  activeAgreements = computed(() => this.agreements().filter((a) => a.status === 'active'));
  totalPaid = computed(() => this.payments().reduce((sum, p) => sum + parseFloat(p.amount), 0));

  /**
   * Fetches all rental agreements for the logged-in user
   */
  loadAgreements() {
    this.isLoading.set(true);
    const obs = this.apiService.get<any>(URLConfig.rentalAgreements).pipe(
      tap((res) => {
        const data = res.data || res;
        this.agreements.set(Array.isArray(data) ? data : []);
      }),
      finalize(() => this.isLoading.set(false)),
    );
    obs.subscribe({
      error: (err) => this.toastService.error('Failed to load agreements'),
    });
    return obs;
  }

  /**
   * Fetches all payment history for the logged-in user
   */
  loadPayments() {
    this.isLoading.set(true);
    const obs = this.apiService.get<any>(URLConfig.paymentHistory).pipe(
      tap((res) => {
        const data = res.data || res;
        this.payments.set(Array.isArray(data) ? data : []);
      }),
      finalize(() => this.isLoading.set(false)),
    );
    obs.subscribe({
      error: (err) => this.toastService.error('Failed to load payment history'),
    });
    return obs;
  }

  /**
   * Processes a payment (initial_rent, monthly_rent, or sale)
   */
  async processPayment(payload: any) {
    try {
      this.isLoading.set(true);
      const res: any = await lastValueFrom(this.apiService.post(URLConfig.processPayment, payload));

      this.toastService.success(res.message || 'Payment processed successfully');

      // Refresh state and WAIT for it to finish
      await Promise.all([lastValueFrom(this.loadAgreements()), lastValueFrom(this.loadPayments())]);

      return res.data;
    } catch (error: any) {
      this.toastService.error(error.error?.message || 'Payment failed. Please try again.');
      throw error;
    } finally {
      this.isLoading.set(true); // Wait, should be false.
      this.isLoading.set(false);
    }
  }
}
