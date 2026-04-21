import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { BaseCrudService } from '../../../../shared/base.crud.service';
import { User } from '../../../../core/interfaces/User';
import { ApiService } from '../../../../shared/api.service';
import { URLConfig } from '../../../../shared/utils/url-config';
import { catchError, finalize, map, tap } from 'rxjs';
import { SellerDocuments, sellerProfile } from '../../../../core/interfaces/seller';
import { ToastService } from '../../../../core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SellerProfileService {
  user: WritableSignal<User | null> = signal<User | null>(null);
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  isLoading = signal(false);
  userProfileData: WritableSignal<sellerProfile | null> = signal<sellerProfile | null>(null);
  userDocs: WritableSignal<SellerDocuments | null> = signal<SellerDocuments | null>(null);

  getCurrentUser() {
    this.isLoading.set(true);
    return this.apiService.get(URLConfig.getCurrentUser).pipe(
      tap((res: any) => {
        this.user.set(res.data);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        this.toastService.error(err.message);
        throw err;
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  updateProfile(data: any) {
    this.isLoading.set(true);
    return this.apiService.patch(URLConfig.sellerProfile, data).pipe(
      tap((res: any) => {
        const d = res.data;
        const mappedData: sellerProfile = {
          ...d,
          profileImage: d.profile_image,
          fullLocation:
            [d.address, d.city, d.state, d.country].filter((p) => !!p).join(', ') ||
            'No address provided',
        };
        this.userProfileData.set(mappedData);
        this.toastService.success(res.message);
      }),
      catchError((err) => {
        this.toastService.error(err.message);
        this.isLoading.set(false);
        throw err;
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  fetchProfile() {
    this.isLoading.set(true);
    return this.apiService.get(URLConfig.sellerProfile).pipe(
      tap((res: any) => {
        const d = res.data;
        const mappedData: sellerProfile = {
          ...d,
          profileImage: d.profile_image,
          fullLocation:
            [d.address, d.city, d.state, d.country].filter((p) => !!p).join(', ') ||
            'No address provided',
        };
        this.userProfileData.set(mappedData);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        // this.toastService.error(err.message);
        throw err;
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  uploadDocs(data: any) {
    this.isLoading.set(true);
    return this.apiService.patch(URLConfig.sellerDocs, data).pipe(
      tap((res: any) => {
        if (res.status == 200) {
          this.userDocs.set(res.data);
          this.toastService.success(res.message);
        }
      }),
      catchError((err: any) => {
        this.toastService.error(err || 'Something wrong');
        this.isLoading.set(false);
        throw err;
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  fetchDocs() {
    return this.apiService.get(URLConfig.sellerDocs).pipe(
      tap((res: any) => {
        this.userDocs.set(res.data);
      }),
      catchError((err: any) => {
        this.toastService.error(err || 'Something wrong');
        this.isLoading.set(false);
        throw err;
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }
}
