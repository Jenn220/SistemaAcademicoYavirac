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
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluacion-instituto.html',
  styleUrl: './evaluacion-instituto.scss'
})
export class EvaluacionInstituto implements OnInit {

  private documentos = inject(Documentos);
  private evaluacionSvc = inject(Evaluacion);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  niveles = NIVELES_RUBRICA;

  evaluacion: EvaluacionInstitutoModel = evaluacionVacia();

  cargando = false;

  guardando = false;

  estadoDocumento: string = 'borrador';
  comentariosDocumento: string = '';
  idDocumento: number | undefined;

  /**
   * F08 (Evaluación Instituto) la califica exclusivamente el DOCENTE.
   * TUTOR_EMPRESARIAL y COORDINADOR solo pueden consultarla en modo
   * lectura — nunca modificarla. El backend ya lo exige (ver
   * verificarPermisoTutor/verificarPermisoCoordinador en
   * detalle-evaluacion.service.ts y los @Roles de
   * evaluacion-instituto.controller.ts), esto solo evita mostrarles una UI
   * de edición que el back terminaría rechazando.
   */
  get soloLectura(): boolean {
    return !this.authService.tieneAlgunRol(['DOCENTE']);
  }

  get esEstudiante(): boolean {
    return this.authService.tieneAlgunRol(['ESTUDIANTE']);
  }

  get esDocente(): boolean {
    return this.authService.tieneAlgunRol(['DOCENTE']);
  }

  get esCoordinador(): boolean {
    return this.authService.tieneAlgunRol(['COORDINADOR']);
  }

  get esTutorEmpresarial(): boolean {
    return this.authService.tieneAlgunRol(['TUTOR_EMPRESARIAL']);
  }

  // El tutor empresarial ya no califica F08 (ver soloLectura), así que ya
  // no tiene sentido que sea quien la mande a revisión.
  get puedeEnviarRevision(): boolean {
    return false;
  }

  get puedeAprobar(): boolean {
    return this.esDocente && this.estadoDocumento === 'pendiente_revision';
  }

  get puedeSolicitarCorrecciones(): boolean {
    return this.esDocente && this.estadoDocumento === 'pendiente_revision';
  }

  get mostrarComentarios(): boolean {
    return this.estadoDocumento === 'rechazado' && !!this.comentariosDocumento;
  }

  private idPractica: number | null = null;
  private idRubrica: number | null = null;

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * defensaProyecto/criteriosProyecto ya vienen del sistema real de
   * evaluaciones (item_rubrica + detalle_evaluacion, resueltos por
   * DocumentoPlantillaService.getEvaluacionInstituto junto con
   * idPractica/idEvaluacion/idRubrica). notaFinalEmpresa también es real:
   * la trae la evaluación EMPRESA de la misma práctica (fix EI-05), ya no
   * es editable a mano. El resto del encabezado y el tema del proyecto
   * siguen viniendo de /documentos/datos (texto descriptivo sin sistema
   * real detrás).
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

    this.idPractica = res?.['idPractica'] ?? null;
    this.idRubrica = res?.['idRubrica'] ?? null;

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
        ? defensaProyecto.map((c) => ({ criterio: c.criterio ?? '', nota: c.puntaje ?? 0, idItem: c.id }))
        : CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),

      tema: datosProyecto.nombre ?? '',

      parametrosProyecto: criteriosProyecto.length
        ? criteriosProyecto.map((c) => ({ criterio: c.criterio ?? '', nota: c.puntaje ?? 0, idItem: c.id }))
        : CRITERIOS_PARAMETROS_PROYECTO.map((criterio) => ({ criterio, nota: 0 })),

      notaFinalEmpresa: res?.['notaFinalEmpresa'] ?? 0,

      observaciones: res?.['observaciones'] ?? '',

      idEvaluacion: res?.['idEvaluacion'] ?? undefined

    };

  }

  cargar(): void {

    this.cargando = true;

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this.idPractica = idPracticaRuta;
      this.ejecutarCargaEvaluacion();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this.idPractica = resp.id_practica;
        this.ejecutarCargaEvaluacion();
      },
      error: () => {
        this.evaluacion = evaluacionVacia();
        this.cargando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar la evaluación del instituto desde el servidor.', 'error');
      }
    });

  }

  private ejecutarCargaEvaluacion(): void {

    if (!this.idPractica) return;

    forkJoin({
      evaluacion: this.documentos.obtenerEvaluacionInstitutoBase(this.idPractica),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ evaluacion, datos }) => {

        this.evaluacion = this.mapearBase(evaluacion, datos);
        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarIdDocumento('F08');

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

    if (this.soloLectura) return;

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
          .crearEvaluacionInstituto({ id_practica: this.idPractica, id_evaluacion_plan_marco: this.idRubrica })
          .pipe(map((creada) => creada.id_evaluacion_instituto!));

    idEvaluacion$
      .pipe(
        switchMap((idEvaluacion) => this.guardarNotas(idEvaluacion).pipe(map(() => idEvaluacion))),
        switchMap((idEvaluacion) =>
          this.evaluacionSvc
            .actualizarEvaluacionInstituto(idEvaluacion, { observaciones: this.evaluacion.observaciones })
            .pipe(map(() => idEvaluacion))
        ),
        switchMap((idEvaluacion) => this.evaluacionSvc.calcularEvaluacionInstituto(idEvaluacion)),
        switchMap((resultado) =>
          this.documentos.guardarEvaluacionInstituto(this.evaluacion, this.idPractica ?? undefined).pipe(
            catchError(() => of(null)),
            map((snapshot) => ({ resultado, snapshot }))
          )
        )
      )
      .subscribe({

        next: ({ resultado, snapshot }) => {

          this.evaluacion.idEvaluacion = resultado.evaluacion.id_evaluacion;
          if (snapshot?.id_documento) {
            this.idDocumento = snapshot.id_documento;
          }
          this.guardando = false;
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Evaluación guardada',
            html: `<b>Nota final instituto:</b> ${resultado.notaFinalInstituto}`
          });

          this.cargarEstadoDocumento();

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
   * ese id_item) la nota de cada criterio calificado. A diferencia de
   * evaluacion-empresarial, aquí la evaluación NO auto-siembra los
   * detalles al crearse (EvaluacionInstitutoService.create() no lo hace),
   * así que la primera vez todos se crean.
   */
  private guardarNotas(idEvaluacion: number) {

    return this.evaluacionSvc.listarDetalles(idEvaluacion).pipe(
      switchMap((detalles) => {

        const porItem = new Map(detalles.map((d) => [Number(d.id_item), d]));

        const operaciones = [...this.evaluacion.defensaProyecto, ...this.evaluacion.parametrosProyecto]
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

  private cargarEstadoDocumento(): void {
    if (!this.idDocumento) {
      return;
    }

    this.documentos.obtenerDocumentoPorId(this.idDocumento).subscribe({
      next: (doc) => {
        this.estadoDocumento = doc?.estado ?? 'borrador';
        this.comentariosDocumento = doc?.comentarios ?? '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  private cargarIdDocumento(codigoFormato: string): void {
    if (this.idDocumento || !this.idPractica) {
      return;
    }

    this.documentos.obtenerIdDocumento(this.idPractica, codigoFormato).subscribe({
      next: (resp) => {
        this.idDocumento = resp?.id_documento ?? undefined;
        this.cargarEstadoDocumento();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  enviarARevision(): void {
    if (!this.idDocumento) {
      Swal.fire('Error', 'Primero debe guardar la evaluación.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Enviar a revisión',
      text: '¿Está seguro de enviar esta evaluación a revisión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'pendiente_revision', '').subscribe({
          next: () => {
            this.estadoDocumento = 'pendiente_revision';
            this.comentariosDocumento = '';
            this.cdr.detectChanges();
            Swal.fire('Enviado', 'La evaluación se envió a revisión correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible enviar la evaluación a revisión.', 'error');
          },
        });
      }
    });
  }

  aprobar(): void {
    if (!this.idDocumento) return;

    Swal.fire({
      title: 'Aprobar evaluación',
      text: '¿Está seguro de aprobar esta evaluación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'aprobado').subscribe({
          next: () => {
            this.estadoDocumento = 'aprobado';
            this.cdr.detectChanges();
            Swal.fire('Aprobado', 'La evaluación fue aprobada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible aprobar la evaluación.', 'error');
          },
        });
      }
    });
  }

  solicitarCorrecciones(): void {
    if (!this.idDocumento) return;

    Swal.fire({
      title: 'Solicitar correcciones',
      input: 'textarea',
      inputLabel: 'Comentarios de corrección (obligatorio)',
      inputPlaceholder: 'Describa los cambios que debe realizar el estudiante...',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Debe ingresar comentarios de corrección';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Solicitar correcciones',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'rechazado', result.value).subscribe({
          next: () => {
            this.estadoDocumento = 'rechazado';
            this.comentariosDocumento = result.value;
            this.cdr.detectChanges();
            Swal.fire('Correcciones solicitadas', 'El estudiante deberá realizar las correcciones indicadas.', 'info');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible solicitar correcciones.', 'error');
          },
        });
      }
    });
  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f08', 'Evaluacion_Instituto', 'landscape');

  }

}
