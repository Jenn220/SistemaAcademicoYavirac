import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

/**
 * Integración en app.routes.ts (única línea fuera de esta carpeta
 * que necesitas tocar):
 *
 *   {
 *     path: 'auth',
 *     loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
 *   }
 */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
  },
  {
    path: 'cambiar-password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cambiar-password/cambiar-password').then((m) => m.CambiarPassword),
  },
  {
    path: 'coordinador/generar-accesos',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['COORDINADOR'] },
    loadComponent: () =>
      import('./pages/coordinador/generar-accesos/generar-accesos').then(
        (m) => m.GenerarAccesos,
      ),
  },
  {
    path: 'coordinador/desbloquear',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['COORDINADOR'] },
    loadComponent: () =>
      import('./pages/coordinador/desbloquear/desbloquear').then((m) => m.Desbloquear),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
