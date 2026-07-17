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

      },
        // =====================================================
  // VINCULACIÓN

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