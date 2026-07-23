import { Routes } from '@angular/router';

// ==============================
// Layout General
// ==============================
import {
  LayoutShellComponent
} from './shared/components/layout/layout.component';

// ==============================
// Auth
// ==============================
import { authGuard } from './modules/auth/guards/auth.guard';

// ==============================
// Dashboard
// ==============================
import {
  Dashboard
} from './modules/dashboard';

// ==============================
// Fase Práctica
// ==============================
import {
  CatalogoDocumentos
} from './modules/fase-practica/pages/catalogo-documentos/catalogo-documentos';

import {
  CartaCompromiso
} from './modules/fase-practica/pages/carta-compromiso/carta-compromiso';

import {
  RegistroAsistencia
} from './modules/fase-practica/pages/registro-asistencia/registro-asistencia';

export const routes: Routes = [

  // =====================================================
  // REDIRECCIÓN INICIAL
  // Si entra a la raíz pura sin estar logueado, pasa por
  // el guard del Layout que lo manda a /auth/login.
  // =====================================================

  // =====================================================
  // AUTH
  // Login, perfil, cambiar contraseña, panel de coordinador
  // Fuera del LayoutShell a propósito: el login no debe
  // mostrar navbar/sidebar.
  // =====================================================
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then(
        m => m.AUTH_ROUTES
      )
  },

  // =====================================================
  // LAYOUT GENERAL
  // Dashboard + Portafolio + Fase Práctica
  // Protegido por authGuard
  // =====================================================
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [

      // ===========================================
      // Dashboard (Ruta por defecto)
      // ===========================================
      {
        path: '',
        component: Dashboard
      },

      {
        path: 'dashboard',
        component: Dashboard
      },

      // ===========================================
      // Fase Práctica
      // ===========================================
      {
        path: 'fase-practica',
        component: CatalogoDocumentos
      },
      {
        path: 'fase-practica/carta-compromiso',
        component: CartaCompromiso
      },
      {
        path: 'fase-practica/registro-asistencia',
        component: RegistroAsistencia
      },

      // ===========================================
      // Portafolio Docente
      // ===========================================
      {
        path: 'portafolio-docente',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/detalle-portafolio/informe-final.component'
              ).then(
                m => m.InformeFinalComponent
              )
          },
          {
            path: 'aceptacion-notas',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/aceptacion-notas/aceptacion-notas.component'
              ).then(
                m => m.AceptacionNotasComponent
              )
          }
        ]
      },

      // ===========================================
      // VINCULACIÓN
      // ===========================================
      {
        path: 'vinculacion',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './modules/vinculacion/pages/lista-vinculacion/lista-vinculacion.component'
              ).then(
                m => m.ListaVinculacionComponent
              )
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import(
                './modules/vinculacion/pages/nuevo-vinculacion/nuevo-vinculacion.component'
              ).then(
                m => m.NuevoVinculacionComponent
              )
          },
          {
            path: 'actividades',
            loadComponent: () =>
              import(
                './modules/vinculacion/pages/actividades-vinculacion/actividades-vinculacion.component'
              ).then(
                m => m.ActividadesVinculacionComponent
              )
          },
          {
            path: 'asistencia',
            loadComponent: () =>
              import(
                './modules/vinculacion/pages/asistencia-tutor/asistencia-tutor.component'
              ).then(
                m => m.AsistenciaTutorComponent
              )
          },
          {
            path: 'informes',
            loadComponent: () =>
              import(
                './modules/vinculacion/pages/informes-vinculacion/informes-vinculacion.component'
              ).then(
                m => m.InformesVinculacionComponent
              )
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './modules/vinculacion/pages/detalle-vinculacion/detalle-vinculacion.component'
              ).then(
                m => m.DetalleVinculacionComponent
              )
          }
        ]
      }
    ]
  },

  // =====================================================
  // 404
  // =====================================================
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];