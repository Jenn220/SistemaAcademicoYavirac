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
import { MOCK_EVALUACION_INSTITUTO } from '../../services/mock-documentos.data';
import { exportarDocumentoWord } from '../../utils/exportar-word';

const NIVELES_RUBRICA: { etiqueta: string; nota: number }[] = [
  { etiqueta: 'Excelente', nota: 4 },
  { etiqueta: 'Bueno', nota: 3 },
  { etiqueta: 'Regular', nota: 2 },
  { etiqueta: 'Deficiente', nota: 1 }
];

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

  // TODO: quitar el mock cuando el login/JWT del frontend esté conectado
  evaluacion: EvaluacionInstitutoModel = structuredClone(MOCK_EVALUACION_INSTITUTO);

  cargando = false;

  guardando = false;

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * El backend (GET /evaluacion-instituto) solo envía una lista plana de
   * criterios (id, criterio, puntaje, maximo), el tutor académico, el
   * instituto y notaFinalEmpresa; no incluye el desglose por rúbrica de la
   * defensa. El resto del encabezado (empresa, nivel, ciclo, fechas, núcleo,
   * carrera, objetivo) y el tema del proyecto se completan con
   * /documentos/datos (el "tema" se toma del nombre del proyecto
   * empresarial, que es lo más parecido que expone el backend hoy).
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): EvaluacionInstitutoModel {

    const estudiante = res?.['estudiante'] ?? {};
    const criteriosProyecto = (res?.['criteriosProyecto'] ?? []) as any[];

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

      defensaProyecto: structuredClone(MOCK_EVALUACION_INSTITUTO.defensaProyecto)
        .map((c: CriterioDefensaProyecto) => ({ ...c, nota: 0 })),

      tema: datosProyecto.nombre ?? '',

      parametrosProyecto: criteriosProyecto.length
        ? criteriosProyecto.map((c) => ({
            criterio: c.criterio ?? '',
            nota: c.maximo ? this.redondear((c.puntaje / c.maximo) * 10) : (c.puntaje ?? 0)
          }))
        : structuredClone(MOCK_EVALUACION_INSTITUTO.parametrosProyecto),

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

        this.evaluacion = structuredClone(MOCK_EVALUACION_INSTITUTO);
        this.cargando = false;
        this.cdr.detectChanges();

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
