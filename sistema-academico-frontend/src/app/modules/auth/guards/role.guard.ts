import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Bloquea el acceso a rutas que exigen un rol específico.
 * Uso:
 *   {
 *     path: 'generar-accesos',
 *     canActivate: [authGuard, roleGuard],
 *     data: { roles: ['COORDINADOR'] },
 *     ...
 *   }
 *
 * Nota: esto es solo UX (evita que alguien sin rol vea la pantalla).
 * La seguridad real siempre la impone el backend con @Roles('COORDINADOR')
 * + RolesGuard en cada endpoint — este guard nunca debe ser el único filtro.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesRequeridos = (route.data['roles'] as string[] | undefined) ?? [];

  if (rolesRequeridos.length === 0 || authService.tieneAlgunRol(rolesRequeridos)) {
    return true;
  }

  router.navigate(['/auth/unauthorized']);
  return false;
};
