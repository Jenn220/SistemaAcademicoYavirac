import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { StudentPresentation } from '../../components/student-presentation/student-presentation';
import { DocumentHeader } from '../../components/document-header/document-header';

import { CartaCompromiso as Carta } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { exportarDocumentoWord } from '../../utils/exportar-word';

function cartaVacia(): Carta {
  return {
    encabezado: '',
    cuerpo: [],
    prohibicionesIntro: '',
    prohibiciones: [],
    compromisosIntro: '',
    compromisosConfidencialidad: [],
    cierre: [],
    estudiante: { nombre: '', cedula: '', carrera: '', curso: '' },
    empresaAsignada: '',
    espacioFirma: { lugar: '', fecha: '' }
  };
}

@Component({
  selector: 'app-carta-compromiso',
  standalone: true,
  imports: [
    CommonModule,
    DocumentHeader,
    StudentPresentation
  ],
  templateUrl: './carta-compromiso.html',
  styleUrl: './carta-compromiso.scss'
})
export class CartaCompromiso implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  carta: Carta = cartaVacia();

  ngOnInit(): void {

    this.cargarCarta();

  }

  /**
   * El endpoint propio de carta-compromiso no manda estudiante.carrera,
   * estudiante.curso ni empresaAsignada, aunque el backend sí los tiene
   * (los usa para armar el texto de cuerpo[0]). Se completan con
   * /documentos/datos, que sí expone esos campos.
   */
  cargarCarta(): void {

    forkJoin({
      carta: this.documentos.obtenerCartaCompromiso(),
      datos: this.documentos.obtenerDatosMaestra().pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ carta, datos }) => {

        const res = carta as unknown as Record<string, any>;
        const estudiante = res?.['estudiante'] ?? {};
        const espacioFirma = res?.['espacioFirma'] ?? {};

        const datosEstudiante = datos?.['estudiante'] ?? {};
        const proyectoEmpresarial = datos?.['proyectoEmpresarial'] ?? {};

        this.carta = {
          encabezado: res?.['encabezado'] ?? '',
          cuerpo: res?.['cuerpo'] ?? [],
          prohibicionesIntro: res?.['prohibicionesIntro'] ?? '',
          prohibiciones: res?.['prohibiciones'] ?? [],
          compromisosIntro: res?.['compromisosIntro'] ?? '',
          compromisosConfidencialidad: res?.['compromisosConfidencialidad'] ?? [],
          cierre: res?.['cierre'] ?? [],
          estudiante: {
            nombre: estudiante.nombre ?? '',
            cedula: estudiante.cedula ?? '',
            carrera: estudiante.carrera ?? datosEstudiante.carrera ?? '',
            curso: estudiante.curso ?? datosEstudiante.curso ?? ''
          },
          empresaAsignada: res?.['empresaAsignada'] ?? proyectoEmpresarial.empresaAsignada ?? '',
          espacioFirma: {
            lugar: espacioFirma.lugar ?? '',
            fecha: espacioFirma.fecha ?? ''
          }
        };

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('❌ Error obteniendo la carta compromiso:', err);

        this.carta = cartaVacia();
        this.cdr.detectChanges();

        Swal.fire('Error', 'No fue posible cargar la carta compromiso desde el servidor.', 'error');

      }

    });

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  imprimir(): void {

    window.print();

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f01', 'Carta_Compromiso', 'portrait');

  }

}