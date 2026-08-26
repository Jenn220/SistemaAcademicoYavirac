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
import { roleGuard } from './modules/auth/guards/role.guard';

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

import {
  ActaInduccionSeguridadPage
} from './modules/fase-practica/pages/acta-induccion-seguridad/acta-induccion-seguridad';

import {
  ActaEntornoLaboralPage
} from './modules/fase-practica/pages/acta-entorno-laboral/acta-entorno-laboral';

import {
  DatosMaestraPage
} from './modules/fase-practica/pages/datos-maestra/datos-maestra';

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

      // ===========================================
      // Fase Práctica
      // ===========================================
      // NOTA: cada documento tiene ruta "sin id" (ESTUDIANTE, resuelve su
      // práctica solo en el back) y ruta "/:idPractica" (DOCENTE/
      // COORDINADOR/TUTOR_EMPRESARIAL, llegan aquí desde el selector
      // /fase-practica/plan-formacion?modo=... porque necesitan elegir a
      // qué estudiante ver — ver plan-formacion-lista.ts).
      {
        path: 'fase-practica/carta-compromiso',
        component: CartaCompromiso
      },
      {
        path: 'fase-practica/carta-compromiso/:idPractica',
        component: CartaCompromiso
      },
      {
        path: 'fase-practica/registro-asistencia',
        component: RegistroAsistencia
      },
      {
        path: 'fase-practica/registro-asistencia/:idPractica',
        component: RegistroAsistencia
      },
      {
        path: 'fase-practica/curriculum',
        component: Curriculum
      },
      {
        path: 'fase-practica/curriculum/:idPractica',
        component: Curriculum
      },
      {
        path: 'fase-practica/informe-aprendizaje',
        component: InformeAprendizaje
      },
      {
        path: 'fase-practica/informe-aprendizaje/:idPractica',
        component: InformeAprendizaje
      },
      {
        path: 'fase-practica/evaluacion-empresarial',
        component: EvaluacionEmpresarial
      },
      {
        path: 'fase-practica/evaluacion-empresarial/:idPractica',
        component: EvaluacionEmpresarial
      },
      {
        path: 'fase-practica/evaluacion-instituto',
        component: EvaluacionInstituto
      },
      {
        path: 'fase-practica/evaluacion-instituto/:idPractica',
        component: EvaluacionInstituto
      },
      {
        path: 'fase-practica/acta-induccion-seguridad',
        component: ActaInduccionSeguridadPage
      },
      {
        path: 'fase-practica/acta-induccion-seguridad/:idPractica',
        component: ActaInduccionSeguridadPage
      },
      {
        path: 'fase-practica/acta-entorno-laboral',
        component: ActaEntornoLaboralPage
      },
      {
        path: 'fase-practica/acta-entorno-laboral/:idPractica',
        component: ActaEntornoLaboralPage
      },

      // ===========================================
      // Plan Marco de Formación / Plan de Rotación
      //
      // Los 4 roles pueden entrar: ESTUDIANTE edita (crea,
      // agrega, elimina resultados de aprendizaje/semanas),
      // el resto solo consulta en modo lectura. ESTUDIANTE
      // se salta el selector (/plan-formacion resuelve su
      // propia práctica vía /mi-practica); los demás roles
      // sí necesitan elegir de la lista qué estudiante ver.
      // El roleGuard aquí es una segunda barrera de UX; la
      // seguridad real la impone el backend con @Roles() por
      // método (GET abierto a los 4, POST/PATCH/DELETE solo
      // ESTUDIANTE).
      // ===========================================
      {
        path: 'fase-practica/plan-formacion',
        canActivate: [roleGuard],
        data: { roles: ['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL'] },
        loadComponent: () =>
          import(
            './modules/fase-practica/pages/plan-formacion-lista/plan-formacion-lista'
          ).then(
            m => m.PlanFormacionLista
          )
      },

      // ===========================================
      // Asignaciones (docente académico / tutor empresarial por práctica)
      // Exclusivo de COORDINADOR — el backend también lo restringe con
      // @Roles('COORDINADOR') en PATCH /practicas/:id, GET /docentes y
      // GET /tutores-empresariales.
      // ===========================================
      {
        path: 'fase-practica/asignaciones',
        canActivate: [roleGuard],
        data: { roles: ['COORDINADOR'] },
        loadComponent: () =>
          import(
            './modules/fase-practica/pages/asignaciones/asignaciones'
          ).then(
            m => m.AsignacionesPage
          )
      },
      {
        path: 'fase-practica/plan-marco/:idPractica',
        canActivate: [roleGuard],
        data: { roles: ['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL'] },
        loadComponent: () =>
          import(
            './modules/fase-practica/pages/plan-marco/plan-marco'
          ).then(
            m => m.PlanMarco
          )
      },
      {
        // TUTOR_EMPRESARIAL no tiene ningún rol en Plan de Rotación (no lo
        // llena ni lo aprueba), así que no se le da acceso ni de lectura.
        path: 'fase-practica/plan-rotacion/:idPractica',
        canActivate: [roleGuard],
        data: { roles: ['ESTUDIANTE', 'DOCENTE', 'COORDINADOR'] },
        loadComponent: () =>
          import(
            './modules/fase-practica/pages/plan-rotacion/plan-rotacion'
          ).then(
            m => m.PlanRotacion
          )
      },
      {
        path: 'fase-practica/datos-maestra',
        canActivate: [roleGuard],
        data: { roles: ['ESTUDIANTE'] },
        loadComponent: () =>
          import(
            './modules/fase-practica/pages/datos-maestra/datos-maestra'
          ).then(
            m => m.DatosMaestraPage
          )
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
            path: 'estudiante',
            canActivate: [roleGuard],
            data: { roles: ['ESTUDIANTE'] },
            children: [
              {
                path: 'inicio-actividades',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/inicio-actividades/inicio-actividades.component'
                  ).then(
                    m => m.InicioActividadesComponent
                  )
              },
              {
                path: 'carta-compromiso',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/carta-compromiso/carta-compromiso.component'
                  ).then(
                    m => m.CartaCompromisoComponent
                  )
              },
              {
                path: 'control-asistencia',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/control-asistencia/control-asistencia.component'
                  ).then(
                    m => m.ControlAsistenciaComponent
                  )
              },
              {
                path: 'registro-asistencia-tutor',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor.component'
                  ).then(
                    m => m.RegistroAsistenciaTutorComponent
                  )
              },
              {
                path: 'plan-aprendizaje',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/plan-aprendizaje/plan-aprendizaje.component'
                  ).then(
                    m => m.PlanAprendizajeComponent
                  )
              },
              {
                path: 'certificado',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/certificado/certificado.component'
                  ).then(
                    m => m.CertificadoComponent
                  )
              },
              {
                path: 'informe-final',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/informe-final/informe-final.component'
                  ).then(
                    m => m.InformeFinalComponent
                  )
              },
              {
                path: '',
                redirectTo: 'inicio-actividades',
                pathMatch: 'full'
              }
            ]
          },
          {
            path: 'docente',
            canActivate: [roleGuard],
            data: { roles: ['DOCENTE'] },
            children: [
              {
                path: 'seleccionar',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/docente/seleccionar-estudiante/seleccionar-estudiante.component'
                  ).then(
                    m => m.SeleccionarEstudianteComponent
                  )
              },
              {
                path: 'estudiante/:id/inicio-actividades',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/inicio-actividades/inicio-actividades.component'
                  ).then(
                    m => m.InicioActividadesComponent
                  )
              },
              {
                path: 'estudiante/:id/control-asistencia',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/control-asistencia/control-asistencia.component'
                  ).then(
                    m => m.ControlAsistenciaComponent
                  )
              },
              {
                path: 'estudiante/:id/registro-asistencia-tutor',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor.component'
                  ).then(
                    m => m.RegistroAsistenciaTutorComponent
                  )
              },
              {
                path: 'estudiante/:id/informe-final',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/informe-final/informe-final.component'
                  ).then(
                    m => m.InformeFinalComponent
                  )
              },
              {
                path: '',
                redirectTo: 'seleccionar',
                pathMatch: 'full'
              }
            ]
          },
          {
            path: '',
            redirectTo: 'estudiante',
            pathMatch: 'full'
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
