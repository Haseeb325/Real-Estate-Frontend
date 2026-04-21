import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { URLConfig } from '../../shared/utils/url-config';
import { ToastService } from '../../core/services/toast.service';
import { catchError, finalize, map, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStore } from '../../shared/authStore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private injector = inject(Injector)

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authStore: AuthStore,
    public router: Router,
  ) {}
  private _loading = signal(false);
  readonly isLoading = this._loading.asReadonly();
  tempToken: WritableSignal<string | null> = signal(localStorage.getItem('tempToken') || null);
  emailForReset: WritableSignal<string | null> = signal(localStorage.getItem('email') || null);
  authToken = signal(localStorage.getItem('authToken') || null);
  // authStore = inject(AuthStore)

  protected handleError() {
    return catchError((error) => {
      this._loading.set(false);
      this.toastService.error(error.error.message || 'Something went wrong');

      return throwError(() => error);
    });
  }
  protected finalize() {
    return finalize(() => this._loading.set(false));
  }

  clearAuthState() {
    this.authToken.set(null);
    this.tempToken.set(null);
    this.emailForReset.set(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('email');
  }

  registerStep1(payload: any) {
    this._loading.set(true);
    return this.apiService.post(URLConfig.regStep1, payload).pipe(
      tap((response: any) => {
        this.tempToken.set(response.data.token);
        localStorage.setItem('tempToken', response.data.token);
        this.toastService.success(response.message || 'Otp sent successfully');
      }),
      // This map is optional
      map((response: any) => {
        return response.data;
      }),

      catchError((error) => {
        this._loading.set(false);
        this.toastService.error(error.error.message || 'Something went wrong');
        localStorage.removeItem('tempToken');
        this.tempToken.set(null);
        return throwError(() => error);
      }),
      this.finalize(),
    );
  }

  verifyOtp(payload: any) {
    this._loading.set(true);

    return this.apiService
      .post(URLConfig.verifyOtp, payload, {
        withCredentials: true,
        headers: {
          token: this.tempToken() || '',
        },
      })
      .pipe(
        tap((response: any) => {
          this.toastService.success(response.message);
        }),
        // map is optional because angular run map and tap when status is only 200 otherwise it runs catchError
        map((response: any) => {
          if (response.status != 200) {
            throw new Error(response.message || 'something wrong');
          }
        }),
        this.handleError(),
        this.finalize(),
      );
  }

  resendOtp() {
    this._loading.set(true);
    return this.apiService.get(`${URLConfig.resendOtp}?token=${this.tempToken()}`).pipe(
      tap((response: any) => {
        this.toastService.success(response.message || 'OTP has been resent');
      }),

      map((response: any) => {
        if (response.status != 200) {
          throw new Error(response.message || 'something wrong');
        }
      }),
      this.handleError(),
      this.finalize(),
    );
  }

  regStep2(payload: any) {
    this._loading.set(true);
    return this.apiService
      .post(URLConfig.regStep2, payload, {
        withCredentials: true,
        headers: {
          token: this.tempToken() || '',
        },
      })
      .pipe(
        tap((response: any) => {
          this.toastService.success(response.message || 'Password set successfully');
          this.tempToken.set(response.data.token);
          localStorage.setItem('tempToken', response.data.token);
        }),
        map((response: any) => {
          if (response.status != 200) {
            throw new Error(response.message || 'something wrong');
          }
        }),
        this.handleError(),
        this.finalize(),
      );
  }

  regStep3(payload: any) {
    this._loading.set(true);
    return this.apiService
      .post(URLConfig.regStep3, payload, {
        withCredentials: true,
        headers: {
          token: this.tempToken() || '',
        },
      })
      .pipe(
        tap((response: any) => {
          this.toastService.success(response.message || 'Account created successfully');
          this.tempToken.set(null);
          localStorage.removeItem('tempToken');
        }),
        map((response: any) => {
          return response.data;
        }),

        this.handleError(),
        this.finalize(),
      );
  }

  resetPassword(payload: any) {
    this._loading.set(true);
    return this.apiService.post(URLConfig.resetPassword, payload).pipe(
      tap((response: any) => {
        this.toastService.success(response.message || 'Otp sent successfully');
        this.tempToken.set(response.data.token);
        this.emailForReset.set(payload.email);
        localStorage.setItem('email', payload.email);
        localStorage.setItem('tempToken', response.data.token);
      }),
      map((response: any) => response.data),
      this.handleError(),
      this.finalize(),
    );
  }

  forgotPassword(payload: any) {
    this._loading.set(true);
    return this.apiService
      .post(URLConfig.forgotPassword, payload, {
        withCredentials: true,
        headers: {
          token: this.tempToken() || '',
          email: this.emailForReset() || '',
        },
      })
      .pipe(
        tap((response: any) => {
          this.toastService.success(response.message || 'Password reset successfully');
          this.tempToken.set(null);
          this.emailForReset.set(null);
          localStorage.removeItem('tempToken');
          localStorage.removeItem('email');
        }),
        map((response: any) => response.data),
        this.handleError(),
        this.finalize(),
      );
  }

  signIn(payload: any) {
    this._loading.set(true);
    return this.apiService.post(URLConfig.signIn, payload).pipe(
      tap((response: any) => {
        this.toastService.success(response.message || 'Signed in successfully');
        this.authToken.set(response.data.access);
        localStorage.setItem('authToken', response.data.access);
        localStorage.removeItem('tempToken');
        this.tempToken.set(null);
        this.authStore.setToken(response.data.access);
        this.authStore.setUser(response.data.user);
        if (response.data.user.role === 'buyer' || response.data.user.role === 'admin') {
          this.router.navigate(['/landing']);
        } else if (response.data.user.role === 'seller') {
          this.router.navigate(['/seller']);
        }
      }),
      map((response: any) => response.data),
      this.handleError(),
      this.finalize(),
    );
  }

  refreshToken() {
    return this.apiService
      .post(
        URLConfig.refreshAccessToken,
        {},
        { withCredentials: true }, // CRITICAL: This allows the cookie to be sent
      )
      .pipe(
        tap((response: any) => {
          if (response?.status === 200 && response?.data?.access) {
            this.authStore.setToken(response.data.access);
            localStorage.setItem('authToken', response.data.access);
          }
        }),
      );
  }

  // router:Router = inject(Router)

  logoutUser() {
    this.apiService.post(URLConfig.logout, {}, { withCredentials: true }).subscribe(() => {
      this.clearAuthState();
      this.authStore?.clearAll();
      this.router.navigate(['/sign-in']);
    });
  }
}
