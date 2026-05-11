import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { URLConfig } from '../../shared/utils/url-config';
import { firstValueFrom } from 'rxjs';

// 1. Define specific interfaces for each "chunk" of data
export interface DashboardStats {
  total_users: number;
  total_properties: number;
  pending_verifications: { total_pending: number; seller: number; properties: number };
}

export interface PaymentStats {
  sales_count: number;
  active_rentings: number;
  revenue_sales: number;
  revenue_rent: number;
}

export interface PropertyStats {
  total: number;
  active: number;
  suspended: number;
  sold: number;
  rented: number;
}

// 2. The "Source of Truth" interface
interface AdminState {
  dashboard: DashboardStats | null;
  payments: PaymentStats | null;
  propertyStats: PropertyStats | null;
  users: any | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private apiService = inject(ApiService);

  // 3. One private signal to hold the entire state
  private state = signal<AdminState>({
    dashboard: null,
    payments: null,
    propertyStats: null,
    users: null,
    isLoading: false,
    error: null,
  });

  // 4. "Selectors" - expose only what the components need
  // This keeps the component code very clean
  readonly dashboard = computed(() => this.state().dashboard);
  readonly payments = computed(() => this.state().payments);
  readonly propertyStats = computed(() => this.state().propertyStats);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  // 5. Clean, typed methods to update the state
  async getDashboardStats() {
    this.updateState({ isLoading: true, error: null });
    try {
      const res: any = await firstValueFrom(this.apiService.get(URLConfig.getDashboardStats));
      const data = res.data || res;
      this.updateState({ dashboard: data, isLoading: false });
    } catch (err: any) {
      this.updateState({ error: err.message, isLoading: false });
    }
  }

  async getPropertyStats() {
    this.updateState({ isLoading: true, error: null });
    try {
      const res: any = await firstValueFrom(this.apiService.get(URLConfig.propertiesStats));
      const data = res.data || res;
      this.updateState({ propertyStats: data, isLoading: false, error: null });
    } catch (error: any) {
      this.updateState({ error: error.message, isLoading: false, propertyStats: null });
    }
  }

  // 6. Easily add new stats without breaking anything
  async getPaymentStats() {
    this.updateState({ isLoading: true, error: null });
    try {
      const res: any = await firstValueFrom(this.apiService.get(URLConfig.paymentStats));
      const data = res.data || res;
      this.updateState({ payments: data, isLoading: false, error: null });
    } catch (error: any) {
      this.updateState({ error: error.message, isLoading: false, payments: null });
    }
  }

  // Helper to update state partially
  private updateState(partialState: Partial<AdminState>) {
    this.state.update((s) => ({ ...s, ...partialState }));
  }
}
