import { computed, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser, DOCUMENT } from "@angular/common";
import { User } from "../core/interfaces/User";

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly token_key = 'auth_token';
  private readonly user_key = 'auth_user';
  
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT); // Use standard Document

  private _token = signal<string | null>(null);
  private _user = signal<User | null>(null);

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._token());

  constructor() {} 

  /**
   * Professional native cookie reader. 
   * This avoids all NG0203/Circular errors because it doesn't 
   * rely on the third-party service for reading.
   */
  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const nameLenPlus = (name.length + 1);
    return this.document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
  }

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = this.getCookie(this.token_key);
        this._token.set(token);

        const userStr = this.getCookie(this.user_key);
        if (userStr && userStr.startsWith('{')) {
          this._user.set(JSON.parse(userStr));
        }
        console.log("✅ AuthStore: state initialized.");
      } catch (e) {
        console.error("AuthStore: Failed to parse cookies", e);
      }
    }
  }

  // Use this only for writing (where the context is always ready)
  setToken(token: string | null) {
    this._token.set(token);
    this.document.cookie = `${this.token_key}=${token || ''}; path=/; max-age=${60*60*24}`;
  }

  setUser(user: User | null) {
    this._user.set(user);
    const value = user ? JSON.stringify(user) : '';
    this.document.cookie = `${this.user_key}=${value}; path=/; max-age=${60*60*24}`;
  }

clearAll() {
  // 1. Reset the signals so the UI updates immediately
  this._token.set(null);
  this._user.set(null);

  // 2. Clear cookies by setting an expired date
  // We set the path to '/' to ensure it matches where they were created
  if (isPlatformBrowser(this.platformId)) {
    this.document.cookie = `${this.token_key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    this.document.cookie = `${this.user_key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}



}


























// // auth.store.ts
// import { Injectable, signal, computed, WritableSignal, inject } from '@angular/core';
// import { URLConfig } from '../utils/url-config';
// import { firstValueFrom } from 'rxjs';
// import { CookieService } from 'ngx-cookie-service';
// import CryptoJS from 'crypto-js';
// import { UserModel } from '../models/user';
// import { ApiService } from '../services/api.service';
// import { ToastService } from '../services/toast.service';
// import { UserDto } from '../models/interfaces';

// @Injectable({ providedIn: 'root' })
// export class AuthStore {
//   private tokenKey = 'hims_token';
//   private userKey = 'hims_user';
//   private secretKey = 'my_super_secret_key_123';

//   private apiService = inject(ApiService);
//   private toastService = inject(ToastService);
//   private cookieService = inject(CookieService);

//   // -----------------------------
//   // Signals
//   // -----------------------------
//   private _token: WritableSignal<string | null> = signal(null);
//   private _user: WritableSignal<UserModel | null> = signal(null);

//   readonly token = computed(() => this._token());
//   readonly currentUser = computed(() => this._user());
//   readonly isAuthenticated = computed(() => !!this._token());

//   constructor() {
//     this.loadToken();
//     this.loadUser();
//   }

//   // -----------------------------
//   // Encrypt / Decrypt helpers
//   // -----------------------------
//   private encrypt(value: string): string {
//     return CryptoJS.AES.encrypt(value, this.secretKey).toString();
//   }

//   private decrypt(value: string): string {
//     const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   }

//   // -----------------------------
//   // Load token & user from cookie
//   // -----------------------------
//   private loadToken() {
//     const encrypted = this.cookieService.get(this.tokenKey);
//     if (encrypted) {
//       try {
//         this._token.set(this.decrypt(encrypted));
//       } catch {
//         this._token.set(null);
//       }
//     }
//   }

//   private loadUser() {
//     const encrypted = this.cookieService.get(this.userKey);
//     if (encrypted) {
//       try {
//         const dto: UserDto = JSON.parse(this.decrypt(encrypted));
//         this._user.set(UserModel.fromJson(dto));
//       } catch {
//         this._user.set(null);
//       }
//     }
//   }

//   // -----------------------------
//   // Set token & user
//   // -----------------------------
//   private setToken(token: string) {
//     const encrypted = this.encrypt(token);
//     this.cookieService.set(this.tokenKey, encrypted, 1, '/');
//     this._token.set(token);
//   }

//   private setUser(user: UserModel) {
//     const dto: UserDto = user.toDto(); // full DTO
//     const encrypted = this.encrypt(JSON.stringify(dto));
//     this.cookieService.set(this.userKey, encrypted, 1, '/');
//     this._user.set(UserModel.fromJson(dto));
//   }

//   // -----------------------------
//   // Login
//   // -----------------------------
//   async login(userid: string, password: string): Promise<void> {
//     try {
//       const response: any = await firstValueFrom(
//         this.apiService.postRequest(URLConfig.login, { userid, password })
//       );

//       if (response.status !== 200 || !response.data || !response.data.token) {
//         throw new Error(response.message || 'Login failed, try again!');
//       }

//       // ✅ Use full UserDto from API
//       const userDto: UserDto = response.data.user;
//       const userModel = UserModel.fromJson(userDto);

//       this.setToken(response.data.token);
//       this.setUser(userModel);

//       this.toastService.success(`Welcome back, ${userModel.name}!`);
//     } catch (error: any) {
//       this.toastService.error(error?.message || 'Login failed');
//       throw error;
//     }
//   }

//   // -----------------------------
//   // Logout
//   // -----------------------------
//   logout(): void {
//     this.cookieService.delete(this.tokenKey);
//     this.cookieService.delete(this.userKey);
//     this._token.set(null);
//     this._user.set(null);
//   }

//   // -----------------------------
//   // Optional: Update user in memory & cookie
//   // -----------------------------
//   updateUser(user: UserModel) {
//     this.setUser(user);
//   }
// }
