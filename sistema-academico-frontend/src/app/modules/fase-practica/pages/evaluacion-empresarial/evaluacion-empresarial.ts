import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Documentos } from '../../services/documentos';
import { Evaluacion, DetalleEvaluacion } from '../../services/evaluacion';
import { AuthService } from '../../../auth/services/auth.service';
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
  private evaluacionSvc = inject(Evaluacion);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  niveles = NIVELES_RUBRICA;

  evaluacion: EvaluacionEmpresarialModel = evaluacionVacia();

  cargando = false;

  guardando = false;

  /** DOCENTE/COORDINADOR/TUTOR_EMPRESARIAL califican; ESTUDIANTE solo consulta. */
  get soloLectura(): boolean {
    return !this.authService.tieneAlgunRol(['DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL']);
  }

  private idPractica: number | null = null;
  private idRubrica: number | null = null;

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * Los criterios (desempeño/defensa) y sus notas ya vienen del sistema
   * real de evaluaciones (item_rubrica + detalle_evaluacion, resueltos por
   * DocumentoPlantillaService.getEvaluacionEmpresarial junto con
   * idPractica/idEvaluacion/idRubrica) — ya no es un snapshot JSON
   * aislado. Los datos de encabezado (nivel, ciclo, fechas, tutor
   * académico, núcleo, carrera, objetivo) siguen viniendo de
   * /documentos/datos, que es solo texto descriptivo sin sistema real
   * detrás.
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): EvaluacionEmpresarialModel {

    const estudiante = res?.['estudiante'] ?? {};
    const criterios = (res?.['criterios'] ?? []) as any[];
    const defensaProyecto = (res?.['defensaProyecto'] ?? []) as any[];

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosProyecto = datos?.['proyectoEmpresarial'] ?? {};

    this.idPractica = res?.['idPractica'] ?? null;
    this.idRubrica = res?.['idRubrica'] ?? null;

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
        ? criterios.map((c) => ({ criterio: c.criterio ?? '', nota: c.puntaje ?? 0, idItem: c.id }))
        : CRITERIOS_DESEMPENO_EMPRESARIAL.map((criterio) => ({ criterio, nota: 0 })),

      defensaProyecto: defensaProyecto.length
        ? defensaProyecto.map((c) => ({ criterio: c.criterio ?? '', nota: c.puntaje ?? 0, idItem: c.id }))
        : CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),

      observaciones: '',

      idEvaluacion: res?.['idEvaluacion'] ?? undefined

    };

  }

  cargar(): void {

    this.cargando = true;

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    forkJoin({
      evaluacion: this.documentos.obtenerEvaluacionEmpresarialBase(idPracticaRuta),
      datos: this.documentos.obtenerDatosMaestra(idPracticaRuta).pipe(catchError(() => of({} as Record<string, any>)))
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

    if (this.soloLectura) return;

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

    if (this.guardando || this.soloLectura) return;

    if (!this.evaluacion.estudiante.nombre || !this.evaluacion.estudiante.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula del estudiante son obligatorios.', 'warning');
      return;

    }

    if (!this.idPractica || !this.idRubrica) {

      Swal.fire('Error', 'No fue posible determinar la práctica o la rúbrica a calificar.', 'error');
      return;

    }

    this.guardando = true;

    const idEvaluacion$: Observable<number> = this.evaluacion.idEvaluacion
      ? of(this.evaluacion.idEvaluacion)
      : this.evaluacionSvc
          .crearEvaluacionEmpresa({ id_practica: this.idPractica, id_evaluacion_plan_marco: this.idRubrica })
          .pipe(map((creada) => creada.id_evaluacion_empresa!));

    idEvaluacion$
      .pipe(
        switchMap((idEvaluacion) => this.guardarNotas(idEvaluacion).pipe(map(() => idEvaluacion))),
        switchMap((idEvaluacion) => this.evaluacionSvc.calcularEvaluacionEmpresa(idEvaluacion)),
        switchMap((resultado) =>
          this.documentos.guardarEvaluacionEmpresarial(this.evaluacion, this.idPractica ?? undefined).pipe(
            catchError(() => of(null)),
            map((snapshot) => ({ resultado, snapshot }))
          )
        )
      )
      .subscribe({

        next: ({ resultado }) => {

          this.evaluacion.idEvaluacion = resultado.evaluacion.id_evaluacion;
          this.guardando = false;
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Evaluación guardada',
            html: `<b>Nota final empresa:</b> ${resultado.notaFinalEmpresa}`
          });

        },

        error: () => {

          this.guardando = false;
          this.cdr.detectChanges();
          Swal.fire('Error', 'No fue posible guardar la evaluación.', 'error');

        }

      });

  }

  /**
   * Crea o actualiza (según ya exista o no un id_detalle_evaluacion para
   * ese id_item) la nota de cada criterio calificado, igual que
   * plan-marco.ts hace con sus ítems.
   */
  private guardarNotas(idEvaluacion: number) {

    return this.evaluacionSvc.listarDetalles(idEvaluacion).pipe(
      switchMap((detalles) => {

        const porItem = new Map(detalles.map((d) => [Number(d.id_item), d]));

        const operaciones = [...this.evaluacion.desempeno, ...this.evaluacion.defensaProyecto]
          .filter((c) => c.idItem)
          .map((c) => {

            const existente = porItem.get(c.idItem!);
            const dto: Partial<DetalleEvaluacion> = { puntaje_asignado: Number(c.nota) || 0 };

            return existente?.id_detalle_evaluacion
              ? this.evaluacionSvc.actualizarDetalle(existente.id_detalle_evaluacion, dto)
              : this.evaluacionSvc.crearDetalle(idEvaluacion, { id_item: c.idItem, ...dto });

          });

        return operaciones.length ? forkJoin(operaciones) : of([]);

      })
    );

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f07', 'Evaluacion_Empresarial', 'landscape');

  }

}
