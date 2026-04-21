// import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';

// import { routes } from './app.routes';
// import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { MessageService } from 'primeng/api';
// import { CookieService } from 'ngx-cookie-service';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes),
//     MessageService,
//     // CookieService,
//     provideHttpClient(withInterceptors([authInterceptor])),
//   ]
// };



import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { MessageService } from 'primeng/api';
// import { CookieService } from 'ngx-cookie-service';
import { AuthStore } from './shared/authStore';

export function initializeAuth(authStore: AuthStore) {
  return (): Promise<void> => {
    return new Promise((resolve) => {
      // Defer to ensure the DOM and Injection Tokens are fully initialized
      setTimeout(() => {
        authStore.init();
        resolve();
      }, 0);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // CookieService,
    MessageService,

    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthStore],
      multi: true
    },

    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};






// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Use withInterceptors
// import { CookieService } from 'ngx-cookie-service'; // Import this!

// import { routes } from './app.routes';
// import { MessageService } from 'primeng/api';
// // Assuming you convert your interceptor to a functional one
// // import { authInterceptor } from './core/interceptors/auth.interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     MessageService,
//     CookieService, // ✅ MUST ADD THIS HERE

//     // ✅ Modern way to provide HttpClient with functional interceptors
//     provideHttpClient(
//         withInterceptors([
//             // authInterceptor // Add your functional interceptor here
//         ])
//     ),
//   ]
// };