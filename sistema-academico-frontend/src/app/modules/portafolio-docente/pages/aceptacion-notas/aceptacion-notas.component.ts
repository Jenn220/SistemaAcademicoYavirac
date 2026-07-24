import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AceptacionNotasService } from '../../services/aceptacion-notas.service';
import {
  CamposManualesEstudiante,
  EstudianteAceptacionDto,
  ReporteNotasResponseDto,
  TIPOS_REPORTE,
} from '../../models/aceptacion-notas.model';

@Component({
  selector: 'app-aceptacion-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aceptacion-notas.component.html',
  styleUrl: './aceptacion-notas.component.scss',
})
export class AceptacionNotasComponent implements OnInit {
  readonly tiposReporte = TIPOS_REPORTE;

  idOfertaAsignatura!: number;
  idPeriodo!: number;
  tipoReporteSeleccionado: string = TIPOS_REPORTE[0].valor;

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly noExisteReporte = signal(false);
  readonly mensajeExito = signal<string | null>(null);

  readonly reporte = signal<ReporteNotasResponseDto | null>(null);

  /**
   * Campos manuales por estudiante (asistencia, observación). El PDF
   * los pide pero el backend no los guarda: viven solo en memoria de
   * esta pantalla, para completar la vista/impresión.
   */
  readonly camposManuales = signal<Map<number, CamposManualesEstudiante>>(new Map());

  readonly fechaHoy = new Date();

  readonly totalEstudiantes = computed(() => this.reporte()?.estudiantes.length ?? 0);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly aceptacionNotasService: AceptacionNotasService,
  ) {}

  ngOnInit(): void {
    this.idOfertaAsignatura = Number(this.route.snapshot.paramMap.get('idOfertaAsignatura'));
    this.idPeriodo = Number(this.route.snapshot.paramMap.get('idPeriodo'));
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noExisteReporte.set(false);
    this.mensajeExito.set(null);

    this.aceptacionNotasService
      .getReporte(this.idOfertaAsignatura, this.tipoReporteSeleccionado)
      .subscribe({
        next: (respuesta) => {
          this.reporte.set(respuesta);
          this.inicializarCamposManuales(respuesta.estudiantes);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          if (err.status === 404) {
            this.noExisteReporte.set(true);
            this.reporte.set(null);
          } else {
            this.error.set('Ocurrió un error al buscar el reporte. Intenta de nuevo.');
          }
        },
      });
  }

  generarReporte(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.aceptacionNotasService
      .generarReporte({
        id_periodo: this.idPeriodo,
        id_oferta_asignatura: this.idOfertaAsignatura,
        tipo_reporte: this.tipoReporteSeleccionado,
      })
      .subscribe({
        next: (respuesta) => {
          this.reporte.set(respuesta);
          this.inicializarCamposManuales(respuesta.estudiantes);
          this.noExisteReporte.set(false);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudo generar el reporte. Verifica que existan estudiantes matriculados.');
        },
      });
  }

  private inicializarCamposManuales(estudiantes: EstudianteAceptacionDto[]): void {
    const mapa = new Map<number, CamposManualesEstudiante>();
    for (const est of estudiantes) {
      mapa.set(est.id_aceptacion, {
        id_aceptacion: est.id_aceptacion,
        asistencia: null,
        observacion: '',
      });
    }
    this.camposManuales.set(mapa);
  }

  obtenerCampoManual(idAceptacion: number): CamposManualesEstudiante {
    return (
      this.camposManuales().get(idAceptacion) ?? {
        id_aceptacion: idAceptacion,
        asistencia: null,
        observacion: '',
      }
    );
  }

  actualizarAsistencia(idAceptacion: number, valor: number | null): void {
    const mapa = new Map(this.camposManuales());
    const actual = this.obtenerCampoManual(idAceptacion);
    mapa.set(idAceptacion, { ...actual, asistencia: valor });
    this.camposManuales.set(mapa);
  }

  actualizarObservacion(idAceptacion: number, valor: string): void {
    const mapa = new Map(this.camposManuales());
    const actual = this.obtenerCampoManual(idAceptacion);
    mapa.set(idAceptacion, { ...actual, observacion: valor });
    this.camposManuales.set(mapa);
  }

  actualizarNota(estudiante: EstudianteAceptacionDto, valor: string): void {
    const nota = valor === '' ? null : Number(valor);
    estudiante.nota_registrada = nota;
  }

  guardarNotas(): void {
    const reporteActual = this.reporte();
    if (!reporteActual) return;

    const estudiantesConNota = reporteActual.estudiantes.filter(
      (est) => est.nota_registrada !== null && est.nota_registrada !== undefined,
    );

    if (estudiantesConNota.length === 0) {
      this.error.set('Ingresa al menos una nota antes de guardar.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.mensajeExito.set(null);

    this.aceptacionNotasService
      .actualizarNotas(reporteActual.reporte.id_reporte_notas, {
        estudiantes: estudiantesConNota.map((est) => ({
          id_aceptacion: est.id_aceptacion,
          nota: est.nota_registrada as number,
        })),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mensajeExito.set('Notas guardadas correctamente.');
        },
        error: () => {
          this.guardando.set(false);
          this.error.set('No se pudieron guardar las notas. Intenta de nuevo.');
        },
      });
  }

  imprimir(): void {
    window.print();
  }
}
