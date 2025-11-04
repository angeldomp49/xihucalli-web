import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../token/TokenStorageService';
import { SessionManagementService } from '../management/SessionManagementService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const sessionManagement = inject(SessionManagementService);
  const token = tokenStorage.getToken();

  if (!token) {
    return next(req);
  }

  if (!tokenStorage.isTokenValid()) {
    tokenStorage.clearTokens();
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        sessionManagement.forceLogout('session_expired');
      }
      return throwError(() => error);
    })
  );
};

