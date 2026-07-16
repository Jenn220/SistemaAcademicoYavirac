import { Routes } from '@angular/router';

// ==============================
// Layout General
// ==============================

import {
  LayoutShellComponent
} from './shared/components/layout/layout.component';


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


// ==============================
// Layout Vinculación
// ==============================

import {
  LayoutShellComponent as VinculacionLayout
} from './modules/vinculacion/components/layout/layout.component';



export const routes: Routes = [

  // =====================================================
  // LAYOUT GENERAL
  // Dashboard + Portafolio + Fase Práctica
  // =====================================================

  {

    path: '',

    component: LayoutShellComponent,

    children: [

      // ===========================================
      // Dashboard
      // ===========================================

      {

        path: '',

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
              )

              .then(
                m => m.InformeFinalComponent
              )

          },



          {

            path: 'aceptacion-notas',

            loadComponent: () =>

              import(
                './modules/portafolio-docente/pages/aceptacion-notas/aceptacion-notas.component'
              )

              .then(
                m => m.AceptacionNotasComponent
              )

          }

        ]

      }

    ]

  },



  // =====================================================
  // VINCULACIÓN
  // LAYOUT INDEPENDIENTE
  // =====================================================

  {

    path: 'vinculacion',

    component: VinculacionLayout,

    children: [

      {

        path: '',

        loadComponent: () =>

          import(
            './modules/vinculacion/pages/lista-vinculacion/lista-vinculacion.component'
          )

          .then(
            m => m.ListaVinculacionComponent
          )

      },



      {

        path: 'nuevo',

        loadComponent: () =>

          import(
            './modules/vinculacion/pages/nuevo-vinculacion/nuevo-vinculacion.component'
          )

          .then(
            m => m.NuevoVinculacionComponent
          )

      },



      {

        path: 'actividades',

        loadComponent: () =>

          import(
            './modules/vinculacion/pages/actividades-vinculacion/actividades-vinculacion.component'
          )

          .then(
            m => m.ActividadesVinculacionComponent
          )

      },



      {

        path: 'asistencia',

        loadComponent: () =>

          import(
            './modules/vinculacion/pages/asistencia-tutor/asistencia-tutor.component'
          )

          .then(
            m => m.AsistenciaTutorComponent
          )

      },



      {

        path: 'informes',

        loadComponent: () =>

          import(
            './modules/vinculacion/pages/informes-vinculacion/informes-vinculacion.component'
          )

          .then(
            m => m.InformesVinculacionComponent
          )

      },



      {

        path: ':id',

        loadComponent: () =>

          import(
            './modules/vinculacion/pages/detalle-vinculacion/detalle-vinculacion.component'
          )

          .then(
            m => m.DetalleVinculacionComponent
          )

      }

    ]

  },



  // =====================================================
  // 404
  // =====================================================

  {

    path: '**',

    redirectTo: ''

  }

];