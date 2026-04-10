import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../features/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private authService = inject(AuthService);

  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<boolean | null>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // ✅ ALWAYS send cookies
    const clonedReq = req.clone({
      withCredentials: true
    });

    return next.handle(clonedReq).pipe(

      catchError((error: HttpErrorResponse) => {


      // ❌ STOP infinite loop for refresh API
      if (req.url.includes('/refresh-access-token')) {
        return throwError(() => error);
      }

        // 🔥 HANDLE 401 (TOKEN EXPIRED)
        if (error.status === 401 && ['/forgot-password', '/sign-in'].includes(req.url)) {
          return this.handle401Error(clonedReq, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {

    // If refresh already running → queue requests
    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter(val => val === true),
        take(1),
        switchMap(() => next.handle(req))
      );
    }

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        this.refreshSubject.next(true);

        // retry original request
        return next.handle(req);
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.refreshSubject.next(false);

        // 🔥 refresh failed → logout user
        this.authService.logoutUser();
        return throwError(() => err);
      })
    );
  }
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


