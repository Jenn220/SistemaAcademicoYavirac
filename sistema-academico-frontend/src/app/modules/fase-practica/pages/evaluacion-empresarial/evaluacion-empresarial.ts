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
import {
  EvaluacionEmpresarial as EvaluacionEmpresarialModel,
  CriterioDefensaProyecto
} from '../../interfaces';
import { CRITERIOS_DESEMPENO_EMPRESARIAL, CRITERIOS_DEFENSA_PROYECTO } from '../../services/rubricas-fase-practica';
import { exportarDocumentoWord } from '../../utils/exportar-word';

const NIVELES_RUBRICA: { etiqueta: string; nota: number }[] = [
  { etiqueta: 'Excelente', nota: 4 },
  { etiqueta: 'Bueno', nota: 3 },
  { etiqueta: 'Regular', nota: 2 },
  { etiqueta: 'Deficiente', nota: 1 }
];

function evaluacionVacia(): EvaluacionEmpresarialModel {
  return {
    estudiante: { nombre: '', cedula: '' },
    encabezado: {
      empresaFormadora: '', nivel: '', cicloAcademico: '',
      fechaInicioFasePractica: '', fechaFinFasePractica: '',
      tutorAcademico: '', nucleoEstructurante: '', tutorEmpresarial: '',
      carrera: '', objetivoNucleoEstructurante: ''
    },
    desempeno: CRITERIOS_DESEMPENO_EMPRESARIAL.map((criterio) => ({ criterio, nota: 0 })),
    defensaProyecto: CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),
    observaciones: ''
  };
}

@Component({
  selector: 'app-evaluacion-empresarial',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './evaluacion-empresarial.html',
  styleUrl: './evaluacion-empresarial.scss'
})
export class EvaluacionEmpresarial implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  niveles = NIVELES_RUBRICA;

  evaluacion: EvaluacionEmpresarialModel = evaluacionVacia();

  cargando = false;

  guardando = false;

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * El backend (GET /evaluacion-empresarial) solo envía una lista plana de
   * criterios (id, criterio, puntaje, maximo); "defensaProyecto" hoy
   * siempre llega vacío desde ahí (el back todavía no lo calcula en este
   * endpoint — ver DocumentoPlantillaService.getEvaluacionEmpresarial).
   * Los datos de encabezado (nivel, ciclo, fechas, tutor académico,
   * núcleo, carrera, objetivo) tampoco vienen en este endpoint, así que
   * se completan con /documentos/datos.
   *
   * Los criterios (desempeño/defensa) son texto FIJO del formato F07
   * (confirmado contra el PDF oficial), no datos de un estudiante: si el
   * back trae criterios reales se usan esos; si no, se cae a las
   * etiquetas fijas con nota en 0 — nunca se inventa una nota.
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): EvaluacionEmpresarialModel {

    const estudiante = res?.['estudiante'] ?? {};
    const criterios = (res?.['criterios'] ?? []) as any[];
    const defensaProyecto = (res?.['defensaProyecto'] ?? []) as any[];

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosProyecto = datos?.['proyectoEmpresarial'] ?? {};

    return {

      estudiante: {
        nombre: estudiante.nombre ?? '',
        cedula: estudiante.cedula ?? ''
      },

      encabezado: {
        empresaFormadora: res?.['empresa'] ?? '',
        nivel: datosEstudiante.nivel ?? '',
        cicloAcademico: datosPeriodo.nombre ?? '',
        fechaInicioFasePractica: datosProyecto.fechaInicio ?? '',
        fechaFinFasePractica: datosProyecto.fechaFin ?? '',
        tutorAcademico: datosCarrera.tutorAcademico ?? '',
        nucleoEstructurante: datosCarrera.nucleoEstructurante ?? '',
        tutorEmpresarial: res?.['tutorEmpresarial'] ?? '',
        carrera: datosEstudiante.carrera ?? '',
        objetivoNucleoEstructurante: datosCarrera.objetivoNucleoEstructurante ?? ''
      },

      desempeno: criterios.length
        ? criterios.map((c) => ({
            criterio: c.criterio ?? '',
            nota: c.maximo ? this.redondear((c.puntaje / c.maximo) * 10) : (c.puntaje ?? 0)
          }))
        : CRITERIOS_DESEMPENO_EMPRESARIAL.map((criterio) => ({ criterio, nota: 0 })),

      defensaProyecto: defensaProyecto.length
        ? defensaProyecto.map((c) => ({ criterio: c.criterio ?? '', nota: c.nota ?? 0 }))
        : CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),

      observaciones: ''

    };

  }

  cargar(): void {

    this.cargando = true;

    forkJoin({
      evaluacion: this.documentos.obtenerEvaluacionEmpresarialBase(),
      datos: this.documentos.obtenerDatosMaestra().pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ evaluacion, datos }) => {

        this.evaluacion = this.mapearBase(evaluacion, datos);
        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: () => {

        this.evaluacion = evaluacionVacia();
        this.cargando = false;
        this.cdr.detectChanges();

        Swal.fire('Error', 'No fue posible cargar la evaluación empresarial desde el servidor.', 'error');

      }

    });

  }

  seleccionarNivel(criterio: CriterioDefensaProyecto, nota: number): void {

    criterio.nota = nota;

  }

  get promedioDesempeno(): number {

    if (!this.evaluacion.desempeno.length) return 0;

    const suma = this.evaluacion.desempeno.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);

    return this.redondear(suma / this.evaluacion.desempeno.length);

  }

  get notaPonderadaDesempeno(): number {

    return this.redondear(this.promedioDesempeno * 7 / 10);

  }

  get notaParcialDefensa(): number {

    return this.evaluacion.defensaProyecto.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);

  }

  get notaMaximaDefensa(): number {

    return this.evaluacion.defensaProyecto.length * 4;

  }

  get notaFinalDefensa(): number {

    if (!this.notaMaximaDefensa) return 0;

    return this.redondear((this.notaParcialDefensa / this.notaMaximaDefensa) * 10);

  }

  get notaPonderadaDefensa(): number {

    return this.redondear(this.notaFinalDefensa * 3 / 10);

  }

  get notaFinalEmpresa(): number {

    return this.redondear(this.notaPonderadaDesempeno + this.notaPonderadaDefensa);

  }

  private redondear(valor: number): number {

    return Math.round(valor * 100) / 100;

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  guardarEnBD(): void {

    if (this.guardando) return;

    if (!this.evaluacion.estudiante.nombre || !this.evaluacion.estudiante.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula del estudiante son obligatorios.', 'warning');
      return;

    }

    this.guardando = true;

    this.documentos.guardarEvaluacionEmpresarial(this.evaluacion).subscribe({

      next: (res) => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({

          icon: 'success',
          title: 'Evaluación guardada',
          html: `<b>ID:</b> ${res.id_documento}<br><b>Formato:</b> ${res.codigo_formato}<br><b>Fecha:</b> ${res.created_at}`

        });

      },

      error: () => {

        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar la evaluación.', 'error');

      }

    });

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f07', 'Evaluacion_Empresarial', 'landscape');

  }

}
