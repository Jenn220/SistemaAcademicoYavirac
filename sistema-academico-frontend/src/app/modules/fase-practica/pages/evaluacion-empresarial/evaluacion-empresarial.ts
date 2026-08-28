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
  EvaluacionEmpresarial as EvaluacionEmpresarialModel,
  CriterioDefensaProyecto,
  CriterioNota10
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
  imports: [CommonModule, FormsModule],
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

  estadoDocumento: string = 'borrador';
  comentariosDocumento: string = '';
  idDocumento: number | undefined;

  /** TUTOR_EMPRESARIAL califica; DOCENTE aprueba (no edita notas); ESTUDIANTE solo consulta. */
  get soloLectura(): boolean {
    return !this.authService.tieneAlgunRol(['TUTOR_EMPRESARIAL']);
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

  // TUTOR_EMPRESARIAL crea y envía a revisión; DOCENTE aprueba
  get puedeEnviarRevision(): boolean {
    return this.esTutorEmpresarial && (this.estadoDocumento === 'borrador' || this.estadoDocumento === 'rechazado');
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
        Swal.fire('Error', 'No fue posible cargar la evaluación empresarial desde el servidor.', 'error');
      }
    });

  }

  private ejecutarCargaEvaluacion(): void {

    if (!this.idPractica) return;

    forkJoin({
      evaluacion: this.documentos.obtenerEvaluacionEmpresarialBase(this.idPractica),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ evaluacion, datos }) => {

        this.evaluacion = this.mapearBase(evaluacion, datos);
        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarIdDocumento('F07');

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

  /**
   * El input number con min/max no bloquea valores fuera de rango si se
   * escriben a mano. Recortar solo el modelo no basta: si el campo visible
   * se queda con el texto de más (ej. "88"), la siguiente tecla se sigue
   * agregando encima ("888", "8888"...) porque Angular no siempre reescribe
   * el DOM cuando el valor "parece" no cambiar entre eventos. Por eso acá se
   * fuerza también el texto del input, no solo el modelo.
   */
  limitarNota(criterio: CriterioNota10, event: Event): void {

    const input = event.target as HTMLInputElement;
    let valor = input.valueAsNumber;

    if (Number.isNaN(valor)) return;

    if (valor > 10) valor = 10;
    if (valor < 0) valor = 0;

    criterio.nota = valor;
    input.value = String(valor);

  }

  /**
   * Bloquea al vuelo teclas que un input number igual deja escribir aunque no
   * formen un número válido (ej. "+" o "-" repetidos). Solo se permiten
   * dígitos, un único punto decimal y las teclas de edición/navegación.
   */
  bloquearTeclaNotaInvalida(event: KeyboardEvent): void {

    const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (teclasPermitidas.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (event.key === '.') {
      const input = event.target as HTMLInputElement;
      if (input.value.includes('.')) event.preventDefault();
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }

  }

  /** Igual que bloquearTeclaNotaInvalida pero para texto pegado (ctrl+V), que no dispara keydown por caracter. */
  limpiarNotaPegada(criterio: CriterioNota10, event: ClipboardEvent): void {

    event.preventDefault();

    const texto = event.clipboardData?.getData('text') ?? '';
    const valor = Number(texto.replace(',', '.').trim());

    if (!Number.isFinite(valor)) return;

    criterio.nota = Math.min(10, Math.max(0, valor));

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
        switchMap((idEvaluacion) =>
          this.evaluacionSvc
            .actualizarEvaluacionEmpresa(idEvaluacion, { observaciones: this.evaluacion.observaciones })
            .pipe(map(() => idEvaluacion))
        ),
        switchMap((idEvaluacion) => this.evaluacionSvc.calcularEvaluacionEmpresa(idEvaluacion)),
        switchMap((resultado) =>
          this.documentos.guardarEvaluacionEmpresarial(this.evaluacion, this.idPractica ?? undefined).pipe(
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
            html: `<b>Nota final empresa:</b> ${resultado.notaFinalEmpresa}`
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

    exportarDocumentoWord('documento-f07', 'Evaluacion_Empresarial', 'landscape');

  }

}
