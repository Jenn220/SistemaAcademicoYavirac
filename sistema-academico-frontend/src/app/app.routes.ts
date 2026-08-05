import { Routes } from '@angular/router';

// ==============================
// Layout General
// ==============================
import { LayoutShellComponent } from './shared/components/layout/layout.component';

// ==============================
// Auth
// ==============================
import { authGuard } from './modules/auth/guards/auth.guard';

// ==============================
// Dashboard
// ==============================
import { Dashboard } from './modules/dashboard';

// ==============================
// Fase Práctica
// ==============================
import { CartaCompromiso } from './modules/fase-practica/pages/carta-compromiso/carta-compromiso';
import { RegistroAsistencia } from './modules/fase-practica/pages/registro-asistencia/registro-asistencia';
import { Curriculum } from './modules/fase-practica/pages/curriculum/curriculum';
import { InformeAprendizaje } from './modules/fase-practica/pages/informe-aprendizaje/informe-aprendizaje';
import { EvaluacionEmpresarial } from './modules/fase-practica/pages/evaluacion-empresarial/evaluacion-empresarial';
import { EvaluacionInstituto } from './modules/fase-practica/pages/evaluacion-instituto/evaluacion-instituto';

export const routes: Routes = [

  // =====================================================
  // REDIRECCIÓN INICIAL
  // =====================================================

  // =====================================================
  // AUTH
  // =====================================================
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then(
        m => m.AUTH_ROUTES
      )
  },

  // =====================================================
  // LAYOUT GENERAL (protegido por authGuard)
  // =====================================================
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [

      // Dashboard
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

      // ===========================================
      // Portafolio Docente
      // ===========================================
      {
        path: 'portafolio-docente',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./modules/portafolio-docente/pages/lista-portafolio/lista-portafolio.component')
                .then(m => m.ListaPortafolioComponent)
          },
          {
            path: 'informe-final/:idOfertaAsignatura',
            loadComponent: () =>
              import('./modules/portafolio-docente/pages/detalle-portafolio/informe-final.component')
                .then(m => m.InformeFinalComponent)
          },
          {
            path: 'seguimiento-pea/:idOfertaAsignatura',
            loadComponent: () =>
              import('./modules/portafolio-docente/pages/seguimiento-pea/seguimiento-pea.component')
                .then(m => m.SeguimientoPeaComponent)
          },
          {
            path: 'aceptacion-notas/:idOfertaAsignatura/:idPeriodo',
            loadComponent: () =>
              import('./modules/portafolio-docente/pages/aceptacion-notas/aceptacion-notas.component')
                .then(m => m.AceptacionNotasComponent)
          }
        ]
      },

      // ===========================================
      // VINCULACIÓN
      // ===========================================
      {
        path: 'vinculacion',
        children: [
          // Rutas para ESTUDIANTE (sin parámetro id, el backend lo resuelve)
          {
            path: 'estudiante',
            children: [
              {
                path: 'inicio-actividades',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/inicio-actividades/inicio-actividades')
                    .then(m => m.InicioActividadesComponent)
              },
              {
                path: 'carta-compromiso',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/carta-compromiso/carta-compromiso')
                    .then(m => m.CartaCompromisoComponent)
              },
              {
                path: 'control-asistencia',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/control-asistencia/control-asistencia')
                    .then(m => m.ControlAsistenciaComponent)
              },
              {
                path: 'registro-asistencia-tutor',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor')
                    .then(m => m.RegistroAsistenciaTutorComponent)
              },
              {
                path: 'plan-aprendizaje',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/plan-aprendizaje/plan-aprendizaje')
                    .then(m => m.PlanAprendizajeComponent)
              },
              {
                path: 'certificado',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/certificado/certificado')
                    .then(m => m.CertificadoComponent)
              },
              {
                path: 'informe-final',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/informe-final/informe-final')
                    .then(m => m.InformeFinalComponent)
              },
              {
                path: '',
                redirectTo: 'inicio-actividades',
                pathMatch: 'full'
              }
            ]
          },
          // Rutas para DOCENTE (con parámetro id de vinculación)
          {
            path: 'docente',
            children: [
              {
                path: 'seleccionar',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/docente/seleccionar-estudiante/seleccionar-estudiante')
                    .then(m => m.SeleccionarEstudianteComponent)
              },
              {
                path: 'estudiante/:id/registro-asistencia-tutor',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor')
                    .then(m => m.RegistroAsistenciaTutorComponent)
              },
              {
                path: 'estudiante/:id/informe-final',
                loadComponent: () =>
                  import('./modules/vinculacion/pages/compartidas/informe-final/informe-final')
                    .then(m => m.InformeFinalComponent)
              },
              {
                path: '',
                redirectTo: 'seleccionar',
                pathMatch: 'full'
              }
            ]
          },
          // Redirección por defecto
          {
            path: '',
            redirectTo: 'estudiante',
            pathMatch: 'full'
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