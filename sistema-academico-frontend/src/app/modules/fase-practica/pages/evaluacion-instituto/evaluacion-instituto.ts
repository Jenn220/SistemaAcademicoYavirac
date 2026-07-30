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
  EvaluacionInstituto as EvaluacionInstitutoModel,
  CriterioDefensaProyecto
} from '../../interfaces';
import { CRITERIOS_DEFENSA_PROYECTO, CRITERIOS_PARAMETROS_PROYECTO } from '../../services/rubricas-fase-practica';
import { exportarDocumentoWord } from '../../utils/exportar-word';

const NIVELES_RUBRICA: { etiqueta: string; nota: number }[] = [
  { etiqueta: 'Excelente', nota: 4 },
  { etiqueta: 'Bueno', nota: 3 },
  { etiqueta: 'Regular', nota: 2 },
  { etiqueta: 'Deficiente', nota: 1 }
];

function evaluacionVacia(): EvaluacionInstitutoModel {
  return {
    estudiante: { nombre: '', cedula: '' },
    encabezado: {
      empresaFormadora: '', nivel: '', cicloAcademico: '',
      fechaInicioFasePractica: '', fechaFinFasePractica: '',
      tutorAcademico: '', nucleoEstructurante: '', tutorEmpresarial: '',
      carrera: '', objetivoNucleoEstructurante: ''
    },
    defensaProyecto: CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),
    tema: '',
    parametrosProyecto: CRITERIOS_PARAMETROS_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),
    notaFinalEmpresa: 0,
    observaciones: ''
  };
}

@Component({
  selector: 'app-evaluacion-instituto',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './evaluacion-instituto.html',
  styleUrl: './evaluacion-instituto.scss'
})
export class EvaluacionInstituto implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  niveles = NIVELES_RUBRICA;

  evaluacion: EvaluacionInstitutoModel = evaluacionVacia();

  cargando = false;

  guardando = false;

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * El backend (GET /evaluacion-instituto) solo envía una lista plana de
   * criterios (id, criterio, puntaje, maximo), el tutor académico, el
   * instituto y notaFinalEmpresa; "defensaProyecto" hoy siempre llega
   * vacío desde ahí (el back todavía no lo calcula en este endpoint — ver
   * DocumentoPlantillaService.getEvaluacionInstituto). El resto del
   * encabezado (empresa, nivel, ciclo, fechas, núcleo, carrera, objetivo)
   * y el tema del proyecto se completan con /documentos/datos (el "tema"
   * se toma del nombre del proyecto empresarial, que es lo más parecido
   * que expone el backend hoy).
   *
   * Los criterios (defensa/parámetros) son texto FIJO del formato F08
   * (confirmado contra el PDF oficial), no datos de un estudiante: si el
   * back trae criterios reales se usan esos; si no, se cae a las
   * etiquetas fijas con nota en 0 — nunca se inventa una nota.
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): EvaluacionInstitutoModel {

    const estudiante = res?.['estudiante'] ?? {};
    const criteriosProyecto = (res?.['criteriosProyecto'] ?? []) as any[];
    const defensaProyecto = (res?.['defensaProyecto'] ?? []) as any[];

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosProyecto = datos?.['proyectoEmpresarial'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    return {

      estudiante: {
        nombre: estudiante.nombre ?? '',
        cedula: estudiante.cedula ?? ''
      },

      encabezado: {
        empresaFormadora: datosEmpresa.razonSocial ?? '',
        nivel: datosEstudiante.nivel ?? '',
        cicloAcademico: datosPeriodo.nombre ?? '',
        fechaInicioFasePractica: datosProyecto.fechaInicio ?? '',
        fechaFinFasePractica: datosProyecto.fechaFin ?? '',
        tutorAcademico: res?.['tutorAcademico'] ?? '',
        nucleoEstructurante: datosCarrera.nucleoEstructurante ?? '',
        tutorEmpresarial: datosEmpresa.tutorEmpresarial ?? '',
        carrera: datosEstudiante.carrera ?? '',
        objetivoNucleoEstructurante: datosCarrera.objetivoNucleoEstructurante ?? ''
      },

      defensaProyecto: defensaProyecto.length
        ? defensaProyecto.map((c) => ({ criterio: c.criterio ?? '', nota: c.nota ?? 0 }))
        : CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),

      tema: datosProyecto.nombre ?? '',

      parametrosProyecto: criteriosProyecto.length
        ? criteriosProyecto.map((c) => ({
            criterio: c.criterio ?? '',
            nota: c.maximo ? this.redondear((c.puntaje / c.maximo) * 10) : (c.puntaje ?? 0)
          }))
        : CRITERIOS_PARAMETROS_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),

      notaFinalEmpresa: res?.['notaFinalEmpresa'] ?? 0,

      observaciones: ''

    };

  }

  cargar(): void {

    this.cargando = true;

    forkJoin({
      evaluacion: this.documentos.obtenerEvaluacionInstitutoBase(),
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

        Swal.fire('Error', 'No fue posible cargar la evaluación del instituto desde el servidor.', 'error');

      }

    });

  }

  seleccionarNivel(criterio: CriterioDefensaProyecto, nota: number): void {

    criterio.nota = nota;

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

  get promedioParametros(): number {

    if (!this.evaluacion.parametrosProyecto.length) return 0;

    const suma = this.evaluacion.parametrosProyecto.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);

    return this.redondear(suma / this.evaluacion.parametrosProyecto.length);

  }

  get notaPonderadaParametros(): number {

    return this.redondear(this.promedioParametros * 7 / 10);

  }

  get notaFinalInstituto(): number {

    return this.redondear(this.notaPonderadaDefensa + this.notaPonderadaParametros);

  }

  get promedioFinalFasePractica(): number {

    return this.redondear((Number(this.evaluacion.notaFinalEmpresa || 0) + this.notaFinalInstituto) / 2);

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

    this.documentos.guardarEvaluacionInstituto(this.evaluacion).subscribe({

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

    exportarDocumentoWord('documento-f08', 'Evaluacion_Instituto', 'landscape');

  }

}
