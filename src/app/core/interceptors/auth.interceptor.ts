import { inject, Injector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../features/auth/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<boolean | null>(null);

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const injector = inject(Injector);

//   const clonedReq = req.clone({
//     withCredentials: true
//   });

//   return next(clonedReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (req.url.includes('/refresh-access-token')) {
//         return throwError(() => error);
//       }

//       // Don't refresh if the error happened on an auth-related URL
      // const isAuthUrl = ['/forgot-password', '/sign-in'].some(url => req.url.includes(url));
//       if (error.status === 401 && !isAuthUrl) {
//         // Fix NG0203: Provide context for services using inject()
//         const authService = runInInjectionContext(injector, () => 
//           injector.get(AuthService)
//         );
//         return handle401Error(clonedReq, next, authService);
//       }

//       return throwError(() => error);
//     })
//   );
// };
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url.includes('/refresh-access-token')) return throwError(() => error);
       const isAuthUrl = ['/forgot-password', '/sign-in'].some(url => req.url.includes(url));

      if (error.status === 401 && !isAuthUrl) {
        // Breaking the loop: Get AuthService only on error
        const authService = injector.get(AuthService); 
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
  if (isRefreshing) {
    return refreshSubject.pipe(
      filter(val => val === true),
      take(1),
      switchMap(() => next(req))
    );
  }

  isRefreshing = true;
  refreshSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap(() => {
      isRefreshing = false;
      refreshSubject.next(true);
      return next(req);
    }),
    catchError((err) => {
      isRefreshing = false;
      refreshSubject.next(false);
      authService.logoutUser();
      return throwError(() => err);
    })
  );
}







// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { AuthInterceptor } from './auth.interceptor';

// providers: [
//   {
//     provide: HTTP_INTERCEPTORS,
//     useClass: AuthInterceptor,
//     multi: true
//   }
// ]
