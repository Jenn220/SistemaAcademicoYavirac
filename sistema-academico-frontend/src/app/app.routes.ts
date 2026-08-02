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
  CartaCompromiso
} from './modules/fase-practica/pages/carta-compromiso/carta-compromiso';

import {
  RegistroAsistencia
} from './modules/fase-practica/pages/registro-asistencia/registro-asistencia';

import {
  Curriculum
} from './modules/fase-practica/pages/curriculum/curriculum';

import {
  InformeAprendizaje
} from './modules/fase-practica/pages/informe-aprendizaje/informe-aprendizaje';

import {
  EvaluacionEmpresarial
} from './modules/fase-practica/pages/evaluacion-empresarial/evaluacion-empresarial';

import {
  EvaluacionInstituto
} from './modules/fase-practica/pages/evaluacion-instituto/evaluacion-instituto';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then(
        m => m.AUTH_ROUTES
      )
  },

  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [

      {
        path: '',
        component: Dashboard
      },

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'fase-practica/carta-compromiso',
        component: CartaCompromiso
      },
      {
        path: 'fase-practica/registro-asistencia',
        component: RegistroAsistencia
      },
      {
        path: 'fase-practica/curriculum',
        component: Curriculum
      },
      {
        path: 'fase-practica/informe-aprendizaje',
        component: InformeAprendizaje
      },
      {
        path: 'fase-practica/evaluacion-empresarial',
        component: EvaluacionEmpresarial
      },
      {
        path: 'fase-practica/evaluacion-instituto',
        component: EvaluacionInstituto
      },

      {
        path: 'portafolio-docente',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/lista-portafolio/lista-portafolio.component'
              ).then(
                m => m.ListaPortafolioComponent
              )
          },
          {
            path: 'informe-final/:idOfertaAsignatura',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/detalle-portafolio/informe-final.component'
              ).then(
                m => m.InformeFinalComponent
              )
          },
          {
            path: 'seguimiento-pea/:idOfertaAsignatura',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/seguimiento-pea/seguimiento-pea.component'
              ).then(
                m => m.SeguimientoPeaComponent
              )
          },
          {
            path: 'aceptacion-notas/:idOfertaAsignatura/:idPeriodo',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/aceptacion-notas/aceptacion-notas.component'
              ).then(
                m => m.AceptacionNotasComponent
              )
          }
        ]
      },

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
      },

      {
        path: 'coordinacion/cierre-periodo',
        loadComponent: () =>
          import(
            './modules/panel-periodos/pages/panel-coordinador/panel-coordinador.component'
          ).then(
            m => m.PanelCoordinadorComponent
          )
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
