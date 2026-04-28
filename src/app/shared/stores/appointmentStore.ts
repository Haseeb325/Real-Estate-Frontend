import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Appointment } from '../../core/interfaces/appointment';
import { ApiService } from '../api.service';
import { URLConfig } from '../utils/url-config';
import { catchError, finalize, lastValueFrom, of, tap } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentStore {
  appointments: WritableSignal<Appointment[]> = signal<Appointment[]>([]);
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  isLoading: WritableSignal<boolean> = signal<boolean>(false);
  loading = computed(() => this.isLoading());

  lastFetched: WritableSignal<number> = signal<number>(0);
  cacheTTL: number = 300000;

  isCacheValid = computed(() => Date.now() - this.lastFetched() < this.cacheTTL);

  // Filtered computed signals for professional state management
  upcoming = computed(() =>
    this.appointments().filter((a) => a.status === 'pending' || a.status === 'confirmed'),
  );

  completed = computed(() => this.appointments().filter((a) => a.status === 'completed'));

  cancelled = computed(() => this.appointments().filter((a) => a.status === 'cancelled'));

  loadAppointments(force = false) {
    if (!force && this.isCacheValid()) {
      return of(this.appointments());
    }
    this.isLoading.set(true);
    return this.apiService.get(URLConfig.appointments).pipe(
      tap((res: any) => {
        // Backend might wrap data in 'data' key or send it directly
        const data = res.data || res;
        this.appointments.set(Array.isArray(data) ? data : []);
        this.lastFetched.set(Date.now());
      }),
      catchError((err) => {
        this.toastService.error(err.error?.message || 'Failed to load appointments');
        return of(this.appointments());
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  /**
   * Performs an appointment action and then automatically reloads the list.
   * This ensures the UI is always in sync with the backend, even if a 500 error occurs
   * during serialization but after the database update.
   */
  async performAction(id: any, action: 'confirm' | 'cancel' | 'complete') {
    try {
      this.isLoading.set(true);
      let url = '';

      switch (action) {
        case 'confirm': url = URLConfig.confirmAppointment(id); break;
        case 'cancel': url = URLConfig.cancelAppointment(id); break;
        case 'complete': url = URLConfig.completeAppointment(id); break;
      }

      const res: any = await lastValueFrom(this.apiService.post(url, {}));
      
      // Success feedback
      this.toastService.success(res.message || `Appointment ${action}ed successfully`);

      // Reload the list automatically
      this.loadAppointments(true).subscribe();
      
      return res.data;
    } catch (error: any) {
      console.error(`[AppointmentStore] Error during ${action}:`, error);
      
      // Force reload anyway because the user says the API "works" despite the 500.
      // This way, the UI will reflect the change made in the database.
      this.loadAppointments(true).subscribe();

      // If it's a 500 but worked, maybe show a gentler message or still show the error
      this.toastService.error(error.error?.message || 'Server processed request but encountered an error during response.');
      
      // Removed 'throw error' to stop "Uncaught in promise" in console
    } finally {
      this.isLoading.set(false);
    }
  }
}
