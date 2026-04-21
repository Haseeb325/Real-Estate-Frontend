import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../shared/api.service';
import { URLConfig } from '../../../shared/utils/url-config';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  isLoading = signal(false);

  getAvailabilities() {
    this.isLoading.set(true);
    return this.apiService.get(URLConfig.sellerAvailabilities).pipe(
      catchError((err) => {
        this.toastService.error(err.error?.message || 'Failed to fetch availabilities');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  createAvailability(data: any) {
    this.isLoading.set(true);
    return this.apiService.post(URLConfig.sellerAvailabilities, data).pipe(
      tap((res: any) => this.toastService.success(res.message)),
      catchError((err) => {
        this.toastService.error(err.error?.message || 'Failed to create availability');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateAvailability(id: string, data: any) {
    this.isLoading.set(true);
    return this.apiService.patch(`${URLConfig.sellerAvailabilities}${id}/`, data).pipe(
      tap((res: any) => this.toastService.success(res.message)),
      catchError((err) => {
        this.toastService.error(err.error?.message || 'Failed to update availability');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteAvailability(id: string) {
    this.isLoading.set(true);
    return this.apiService.delete(`${URLConfig.sellerAvailabilities}${id}/`).pipe(
      tap((res: any) => this.toastService.success(res.message)),
      catchError((err) => {
        this.toastService.error(err.error?.message || 'Failed to delete availability');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }
}
