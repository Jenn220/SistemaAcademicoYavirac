import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Adjunta el JWT a cada request saliente y, si el backend responde 401
 * (token vencido, inválido, o cuenta bloqueada entre requests), cierra
 * la sesión local y redirige al login.
 *
 * Registrar en app.config.ts:
 *   provideHttpClient(withInterceptors([authInterceptor]))
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token();
  const reqConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error 401 ocurre intentando cambiar password, NO cerramos sesión
      const esCambiarPassword = req.url.includes('/cambiar-password');

      if (error.status === 401 && !esCambiarPassword) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
