import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

import { Documentos } from '../../services/documentos';

@Component({
  selector: 'app-catalogo-documentos',
  imports: [CommonModule],
  templateUrl: './catalogo-documentos.html',
  styleUrl: './catalogo-documentos.scss',
})
export class CatalogoDocumentos {

  private router = inject(Router);

  private documentos = inject(Documentos);

  abrirCarta(){

    this.router.navigate([
      '/carta-compromiso'
    ]);

  }

  abrirRegistro(){

    this.router.navigate([
      '/registro-asistencia'
    ]);

  }

  guardarCarta() {

  this.documentos.obtenerCartaCompromiso().subscribe({

    next: (carta) => {

      this.documentos.guardarCartaCompromiso(carta).subscribe({

        next: (res) => {

          Swal.fire({

            icon: 'success',

            title: 'Documento guardado',

            html: `

              <b>ID:</b> ${res.id_documento}<br>

              <b>Formato:</b> ${res.codigo_formato}<br>

              <b>Fecha:</b> ${res.created_at}

            `

          });

        },

        error: () => {

          Swal.fire(

            'Error',

            'No fue posible guardar la carta.',

            'error'

          );

        }

      });

    },

    error: () => {

      Swal.fire(

        'Error',

        'No fue posible obtener la carta.',

        'error'

      );

    }

  });

}

  guardarRegistro() {

  this.documentos.obtenerRegistroAsistencia().subscribe({

    next: (registro) => {

      this.documentos.guardarRegistroAsistencia(registro).subscribe({

        next: (res) => {

          Swal.fire({

            icon: 'success',

            title: 'Documento guardado',

            html: `

              <b>ID:</b> ${res.id_documento}<br>

              <b>Formato:</b> ${res.codigo_formato}<br>

              <b>Fecha:</b> ${res.created_at}

            `

          });

        },

        error: () => {

          Swal.fire(

            'Error',

            'No fue posible guardar el registro.',

            'error'

          );

        }

      });

    },

    error: () => {

      Swal.fire(

        'Error',

        'No fue posible obtener el registro.',

        'error'

      );

    }

  });

}

}