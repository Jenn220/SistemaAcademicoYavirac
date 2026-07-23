import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Bloquea el acceso a rutas que requieren sesión iniciada.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  // Redirige al login usando UrlTree para evitar fallos en los ciclos de navegación de Angular
  return router.createUrlTree(['/auth/login']);
};