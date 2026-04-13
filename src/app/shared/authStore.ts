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
