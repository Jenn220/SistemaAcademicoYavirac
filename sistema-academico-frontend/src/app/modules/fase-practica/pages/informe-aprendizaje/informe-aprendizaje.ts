import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Documentos } from '../../services/documentos';
import { DocumentHeader } from '../../components/document-header/document-header';
import { InformeAprendizajeDocumento } from '../../interfaces';
import { exportarDocumentoWord } from '../../utils/exportar-word';

function informeVacio(): InformeAprendizajeDocumento {
  return {
    estudiante: { nombre: '', cedula: '' },
    encabezado: {
      empresaFormadora: '', nivel: '', cicloAcademico: '',
      fechaInicioFasePractica: '', fechaFinFasePractica: '',
      tutorAcademico: '', nucleoEstructurante: '', tutorEmpresarial: '',
      carrera: '', objetivoNucleoEstructurante: ''
    },
    semanas: [],
    reflexionAprendizaje: '',
    observacionesEmpresa: ''
  };
}

@Component({
  selector: 'app-informe-aprendizaje',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './informe-aprendizaje.html',
  styleUrl: './informe-aprendizaje.scss'
})
export class InformeAprendizaje implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  informe: InformeAprendizajeDocumento = informeVacio();

  cargando = false;

  guardando = false;

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * El backend anida al estudiante DENTRO de encabezado (no en la raíz), y
   * usa otros nombres de campo: "empresa" (no empresaFormadora),
   * "cicloAcademico" (no periodoAcademico), "fechaInicio"/"fechaFin" (no
   * fechaInicioFasePractica/fechaFinFasePractica). Este mapeo leía la
   * llave equivocada para cicloAcademico ("periodoAcademico", que no
   * existe en la respuesta) así que quedaba vacío aunque el dato sí
   * viajara. Se completa con /documentos/datos cuando el propio endpoint
   * no trae el valor.
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): InformeAprendizajeDocumento {

    const encabezado = res?.['encabezado'] ?? {};
    const estudiante = encabezado?.['estudiante'] ?? {};
    const semanas = (res?.['semanas'] ?? []) as any[];

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosProyecto = datos?.['proyectoEmpresarial'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    return {
      estudiante: {
        nombre: estudiante.nombre ?? datosEstudiante.nombre ?? '',
        cedula: estudiante.cedula ?? datosEstudiante.cedula ?? ''
      },
      encabezado: {
        empresaFormadora: encabezado.empresa || datosProyecto.empresaAsignada || '',
        nivel: encabezado.nivel || datosEstudiante.nivel || '',
        cicloAcademico: encabezado.cicloAcademico || datosPeriodo.nombre || '',
        fechaInicioFasePractica: encabezado.fechaInicio || datosProyecto.fechaInicio || '',
        fechaFinFasePractica: encabezado.fechaFin || datosProyecto.fechaFin || '',
        tutorAcademico: encabezado.tutorAcademico || datosCarrera.tutorAcademico || '',
        nucleoEstructurante: encabezado.nucleoEstructurante || datosCarrera.nucleoEstructurante || '',
        tutorEmpresarial: encabezado.tutorEmpresarial || datosEmpresa.tutorEmpresarial || '',
        carrera: encabezado.carrera || datosEstudiante.carrera || '',
        objetivoNucleoEstructurante: encabezado.objetivoNucleoEstructurante || datosCarrera.objetivoNucleoEstructurante || ''
      },
      semanas: semanas.map((s) => ({
        semana: s.semana ?? 0,
        fechaInicio: s.fechaInicio ?? '',
        fechaFin: s.fechaFin ?? '',
        puestoAprendizaje: s.puestoAprendizaje ?? '',
        actividadesRealizadas: s.actividadesRealizadas ?? '',
        actividadesAutonomas: s.actividadesAutonomas ?? ''
      })),
      reflexionAprendizaje: semanas[0]?.reflexion ?? '',
      observacionesEmpresa: semanas[0]?.observacionesEmpresa ?? ''
    };

  }

  cargar(): void {

    this.cargando = true;

    forkJoin({
      informe: this.documentos.obtenerInformeAprendizajeBase(),
      datos: this.documentos.obtenerDatosMaestra().pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ informe, datos }) => {

        this.informe = this.mapearBase(informe, datos);
        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: () => {

        this.informe = informeVacio();
        this.cargando = false;
        this.cdr.detectChanges();

        Swal.fire('Error', 'No fue posible cargar el informe de aprendizaje desde el servidor.', 'error');

      }

    });

  }

  agregarSemana(): void {

    const numero = this.informe.semanas.length + 1;

    this.informe.semanas.push({
      semana: numero,
      fechaInicio: '',
      fechaFin: '',
      puestoAprendizaje: '',
      actividadesRealizadas: '',
      actividadesAutonomas: ''
    });

  }

  quitarSemana(i: number): void {

    this.informe.semanas.splice(i, 1);

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  guardarEnBD(): void {

    if (this.guardando) return;

    if (!this.informe.estudiante.nombre || !this.informe.estudiante.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula del estudiante son obligatorios.', 'warning');
      return;

    }

    this.guardando = true;

    this.documentos.guardarInformeAprendizaje(this.informe).subscribe({

      next: (res) => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({

          icon: 'success',
          title: 'Informe guardado',
          html: `<b>ID:</b> ${res.id_documento}<br><b>Formato:</b> ${res.codigo_formato}<br><b>Fecha:</b> ${res.created_at}`

        });

      },

      error: () => {

        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar el informe.', 'error');

      }

    });

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f06', 'Informe_Aprendizaje', 'landscape');

  }

}
