import { Routes } from '@angular/router';

// Layout
import { LayoutShellComponent } from './shared/components/layout/layout.component';

// Auth Guard
import { authGuard } from './modules/auth/guards/auth.guard';
import { roleGuard } from './modules/auth/guards/role.guard';

// Dashboard
import { Dashboard } from './modules/dashboard';

// Fase Práctica
import { CartaCompromiso } from './modules/fase-practica/pages/carta-compromiso/carta-compromiso';
import { RegistroAsistencia } from './modules/fase-practica/pages/registro-asistencia/registro-asistencia';
import { Curriculum } from './modules/fase-practica/pages/curriculum/curriculum';
import { InformeAprendizaje } from './modules/fase-practica/pages/informe-aprendizaje/informe-aprendizaje';
import { EvaluacionEmpresarial } from './modules/fase-practica/pages/evaluacion-empresarial/evaluacion-empresarial';
import { EvaluacionInstituto } from './modules/fase-practica/pages/evaluacion-instituto/evaluacion-instituto';

export const routes: Routes = [
  // Auth
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Layout protegido
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard
      { path: '', component: Dashboard },
      { path: 'dashboard', component: Dashboard },

      // Fase Práctica
      {
        path: 'fase-practica',
        children: [
          { path: 'carta-compromiso', component: CartaCompromiso },
          { path: 'registro-asistencia', component: RegistroAsistencia },
          { path: 'curriculum', component: Curriculum },
          { path: 'informe-aprendizaje', component: InformeAprendizaje },
          { path: 'evaluacion-empresarial', component: EvaluacionEmpresarial },
          { path: 'evaluacion-instituto', component: EvaluacionInstituto },
        ],
      },

      // Portafolio Docente
      {
        path: 'portafolio-docente',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/lista-portafolio/lista-portafolio.component'
              ).then((m) => m.ListaPortafolioComponent),
          },
          {
            path: 'informe-final/:idOfertaAsignatura',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/detalle-portafolio/informe-final.component'
              ).then((m) => m.InformeFinalComponent),
          },
          {
            path: 'seguimiento-pea/:idOfertaAsignatura',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/seguimiento-pea/seguimiento-pea.component'
              ).then((m) => m.SeguimientoPeaComponent),
          },
          {
            path: 'aceptacion-notas/:idOfertaAsignatura/:idPeriodo',
            loadComponent: () =>
              import(
                './modules/portafolio-docente/pages/aceptacion-notas/aceptacion-notas.component'
              ).then((m) => m.AceptacionNotasComponent),
          },
        ],
      },

      // VINCULACIÓN (ESTUDIANTE y DOCENTE)
      {
        path: 'vinculacion',
        children: [
          // Estudiante - solo rol ESTUDIANTE
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
                  ).then((m) => m.InicioActividadesComponent),
              },
              {
                path: 'carta-compromiso',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/carta-compromiso/carta-compromiso.component'
                  ).then((m) => m.CartaCompromisoComponent),
              },
              {
                path: 'control-asistencia',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/control-asistencia/control-asistencia.component'
                  ).then((m) => m.ControlAsistenciaComponent),
              },
              {
                path: 'registro-asistencia-tutor',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor.component'
                  ).then((m) => m.RegistroAsistenciaTutorComponent),
              },
              {
                path: 'plan-aprendizaje',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/plan-aprendizaje/plan-aprendizaje.component'
                  ).then((m) => m.PlanAprendizajeComponent),
              },
              {
                path: 'certificado',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/certificado/certificado.component'
                  ).then((m) => m.CertificadoComponent),
              },
              {
                path: 'informe-final',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/informe-final/informe-final.component'
                  ).then((m) => m.InformeFinalComponent),
              },
              {
                path: '',
                redirectTo: 'inicio-actividades',
                pathMatch: 'full',
              },
            ],
          },
          // Docente - solo rol DOCENTE
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
                  ).then((m) => m.SeleccionarEstudianteComponent),
              },
              // ✅ INICIO DE ACTIVIDADES
              {
                path: 'estudiante/:id/inicio-actividades',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/inicio-actividades/inicio-actividades.component'
                  ).then((m) => m.InicioActividadesComponent),
              },
              // ✅ CONTROL DE ASISTENCIA
              {
                path: 'estudiante/:id/control-asistencia',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/control-asistencia/control-asistencia.component'
                  ).then((m) => m.ControlAsistenciaComponent),
              },
              {
                path: 'estudiante/:id/registro-asistencia-tutor',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor.component'
                  ).then((m) => m.RegistroAsistenciaTutorComponent),
              },
              {
                path: 'estudiante/:id/informe-final',
                loadComponent: () =>
                  import(
                    './modules/vinculacion/pages/compartidas/informe-final/informe-final.component'
                  ).then((m) => m.InformeFinalComponent),
              },
              {
                path: '',
                redirectTo: 'seleccionar',
                pathMatch: 'full',
              },
            ],
          },
          // Redirección por defecto
          {
            path: '',
            redirectTo: 'estudiante',
            pathMatch: 'full',
          },
        ],
      },

      // Coordinación
      {
        path: 'coordinacion/cierre-periodo',
        loadComponent: () =>
          import(
            './modules/panel-periodos/pages/panel-coordinador/panel-coordinador.component'
          ).then((m) => m.PanelCoordinadorComponent),
      },
    ],
  },

  // 404
  { path: '**', redirectTo: 'auth/login' },
];