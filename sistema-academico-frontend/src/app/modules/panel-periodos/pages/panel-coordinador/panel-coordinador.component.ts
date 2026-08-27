import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  CarreraCatalogo,
  CoordinadorDisponible,
  CrearPeriodoCarreraRequest,
  HistorialPeriodoCarrera,
  PeriodoCarrera,
  PeriodoPermitido,
  ResumenCierrePeriodo,
} from '../../models/periodo-carrera.model';

import {
  CierrePeriodoService,
} from '../../services/cierre-periodo.service';

import {
  ESTADOS_PERIODO_CARRERA,
} from '../../models/estados.constants';

interface FormularioCrearPeriodo {
  anio: number;

  numeroPeriodo:
    | '1P'
    | '2P';

  idCarrera:
    number | null;

  idCoordinador:
    number | null;

  nombrePeriodo: string;

  fechaInicio: string;
  fechaFin: string;

  fechaInicioAporte1: string;
  fechaFinAporte1: string;

  fechaInicioAporte2: string;
  fechaFinAporte2: string;

  fechaInicioSupletorio: string;
  fechaFinSupletorio: string;

  fechaInicioFaseTeorica: string;
  fechaFinFaseTeorica: string;

  fechaInicioFasePractica: string;
  fechaFinFasePractica: string;
}

@Component({
  selector:
    'app-panel-coordinador',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl:
    './panel-coordinador.component.html',

  styleUrls: [
    './panel-coordinador.component.scss',
  ],
})
export class PanelCoordinadorComponent
  implements OnInit
{
  /*
   * ============================================================
   * DATOS PRINCIPALES
   * ============================================================
   */

  periodos:
    PeriodoCarrera[] = [];

  resumen:
    ResumenCierrePeriodo |
    null = null;

  historial:
    HistorialPeriodoCarrera[] = [];

  coordinadores:
    CoordinadorDisponible[] = [];

  periodoSeleccionado:
    PeriodoCarrera |
    null = null;

  /*
   * ============================================================
   * CATÁLOGOS DE CREACIÓN
   * ============================================================
   */

  carrerasCatalogo:
    CarreraCatalogo[] = [];

  coordinadoresCatalogo:
    CoordinadorDisponible[] = [];

  periodosPermitidos:
    PeriodoPermitido[] = [];

  /*
   * ============================================================
   * FORMULARIO CREACIÓN
   * ============================================================
   */

  formularioCrearPeriodo:
    FormularioCrearPeriodo =
      this.crearFormularioInicial();

  /*
   * ============================================================
   * REASIGNACIÓN
   * ============================================================
   */

  idNuevoCoordinador:
    number | null = null;

  motivoReasignacion = '';

  /*
   * ============================================================
   * MODALES
   * ============================================================
   */

  mostrarConfirmacion = false;

  mostrarHistorial = false;

  mostrarReasignacion = false;

  mostrarCreacionPeriodo = false;

  /*
   * ============================================================
   * ESTADOS DE CARGA
   * ============================================================
   */

  cargandoPeriodos = false;

  cargandoResumen = false;

  cargandoHistorial = false;

  cargandoCoordinadores = false;

  cargandoCatalogos = false;

  cerrando = false;

  reasignando = false;

  creandoPeriodo = false;

  /*
   * ============================================================
   * MENSAJES
   * ============================================================
   */

  mensaje = '';
  error = '';
  errorCreacionPeriodo = '';

  readonly ESTADOS =
    ESTADOS_PERIODO_CARRERA;

  constructor(
    private readonly cierrePeriodoService:
      CierrePeriodoService,

    private readonly cdr:
      ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  /*
   * ============================================================
   * LISTAR PERÍODOS
   * ============================================================
   */

  cargarPeriodos(): void {
    this.cargandoPeriodos = true;
    this.error = '';

    this.cierrePeriodoService
      .obtenerPeriodosDelCoordinador()
      .subscribe({
        next: (periodos) => {
          this.periodos =
            periodos;

          this.cargandoPeriodos =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.cargandoPeriodos =
            false;

          this.mostrarError(
            error,
            'No fue posible cargar los períodos del coordinador.',
          );
        },
      });
  }

  /*
   * ============================================================
   * CREAR PERÍODO
   * ============================================================
   */

  abrirCreacionPeriodo(): void {
    this.error = '';
    this.errorCreacionPeriodo = '';
    this.mensaje = '';

    this.formularioCrearPeriodo =
      this.crearFormularioInicial();

    this.carrerasCatalogo = [];
    this.coordinadoresCatalogo = [];
    this.periodosPermitidos = [];

    this.mostrarCreacionPeriodo = true;
    this.cargandoCatalogos = true;

    this.cierrePeriodoService
      .obtenerCatalogosCreacion()
      .subscribe({
        next: (catalogos) => {
          this.carrerasCatalogo =
            catalogos.carreras;

          this.coordinadoresCatalogo =
            catalogos.coordinadores;

          this.periodosPermitidos =
            catalogos.periodosPermitidos;

          if (
            this.periodosPermitidos
              .length > 0
          ) {
            this.formularioCrearPeriodo
              .numeroPeriodo =
              this.periodosPermitidos[0]
                .valor;
          }

          this.cargandoCatalogos =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.cargandoCatalogos =
            false;

          this.error = '';

          this.errorCreacionPeriodo =
            this.obtenerMensajeError(
              error,
              'No fue posible cargar los datos necesarios para crear el período.',
            );

          console.error(error);

          this.cdr.detectChanges();
        },
      });
  }

  cerrarModalCreacionPeriodo(): void {
    if (
      this.creandoPeriodo
    ) {
      return;
    }

    this.mostrarCreacionPeriodo =
      false;

    this.errorCreacionPeriodo = '';
    this.error = '';
  }

  crearPeriodo(): void {
    this.error = '';
    this.errorCreacionPeriodo = '';
    this.mensaje = '';

    if (
      !this.formularioCreacionValido()
    ) {
      this.errorCreacionPeriodo =
        'Complete correctamente todos los campos obligatorios del período.';

      this.error = '';

      this.cdr.detectChanges();

      return;
    }

    const formulario =
      this.formularioCrearPeriodo;

    const dto:
      CrearPeriodoCarreraRequest = {
      anio:
        Number(
          formulario.anio,
        ),

      numeroPeriodo:
        formulario.numeroPeriodo,

      idCarrera:
        Number(
          formulario.idCarrera,
        ),

      idCoordinador:
        Number(
          formulario.idCoordinador,
        ),

      fechaInicio:
        formulario.fechaInicio,

      fechaFin:
        formulario.fechaFin,
    };

    if (
      formulario.nombrePeriodo
        .trim()
    ) {
      dto.nombrePeriodo =
        formulario.nombrePeriodo
          .trim();
    }

    this.agregarFechaOpcional(
      dto,
      'fechaInicioAporte1',
      formulario.fechaInicioAporte1,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaFinAporte1',
      formulario.fechaFinAporte1,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaInicioAporte2',
      formulario.fechaInicioAporte2,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaFinAporte2',
      formulario.fechaFinAporte2,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaInicioSupletorio',
      formulario.fechaInicioSupletorio,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaFinSupletorio',
      formulario.fechaFinSupletorio,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaInicioFaseTeorica',
      formulario.fechaInicioFaseTeorica,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaFinFaseTeorica',
      formulario.fechaFinFaseTeorica,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaInicioFasePractica',
      formulario.fechaInicioFasePractica,
    );

    this.agregarFechaOpcional(
      dto,
      'fechaFinFasePractica',
      formulario.fechaFinFasePractica,
    );

    this.creandoPeriodo =
      true;

    this.cierrePeriodoService
      .crearPeriodoCarrera(dto)
      .subscribe({
        next: (respuesta) => {
          this.creandoPeriodo =
            false;

          this.mostrarCreacionPeriodo =
            false;

          this.mensaje =
            respuesta.mensaje;

          this.cargarPeriodos();

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.creandoPeriodo = false;

          this.error = '';

          this.errorCreacionPeriodo =
            this.obtenerMensajeError(
              error,
              'No fue posible crear el período académico.',
            );

          console.error(error);

          this.cdr.detectChanges();
        },
      });
  }

  get codigoPeriodoGenerado():
    string {
    const anio =
      Number(
        this.formularioCrearPeriodo
          .anio,
      );

    if (
      !Number.isInteger(anio) ||
      anio < 2000 ||
      anio > 2100
    ) {
      return '';
    }

    return `${anio}-${this.formularioCrearPeriodo.numeroPeriodo}`;
  }

  formularioCreacionValido():
    boolean {
    const formulario =
      this.formularioCrearPeriodo;

    const anio =
      Number(
        formulario.anio,
      );

    if (
      !Number.isInteger(anio) ||
      anio < 2000 ||
      anio > 2100
    ) {
      return false;
    }

    if (
      formulario.numeroPeriodo !==
        '1P' &&
      formulario.numeroPeriodo !==
        '2P'
    ) {
      return false;
    }

    if (
      !formulario.idCarrera ||
      !formulario.idCoordinador
    ) {
      return false;
    }

    if (
      !formulario.fechaInicio ||
      !formulario.fechaFin
    ) {
      return false;
    }

    const fechaInicio =
      this.convertirFechaLocal(
        formulario.fechaInicio,
      );

    const fechaFin =
      this.convertirFechaLocal(
        formulario.fechaFin,
      );

    if (
      !fechaInicio ||
      !fechaFin ||
      fechaFin <= fechaInicio
    ) {
      return false;
    }

    return true;
  }

  /*
   * ============================================================
   * SELECCIONAR PERÍODO
   * ============================================================
   */

  seleccionarPeriodo(
    periodo: PeriodoCarrera,
  ): void {
    this.periodoSeleccionado =
      periodo;

    this.resumen = null;

    this.historial = [];

    this.coordinadores = [];

    this.mensaje = '';
    this.error = '';
  }

  /*
   * ============================================================
   * RESUMEN
   * ============================================================
   */

  verResumen(
    periodo: PeriodoCarrera,
  ): void {
    this.seleccionarPeriodo(
      periodo,
    );

    this.cargandoResumen =
      true;

    this.cierrePeriodoService
      .obtenerResumenCierre(
        periodo.idPeriodoCarrera,
      )
      .subscribe({
        next: (resumen) => {
          this.resumen =
            resumen;

          this.cargandoResumen =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.cargandoResumen =
            false;

          this.mostrarError(
            error,
            'No fue posible obtener el resumen del período.',
          );
        },
      });
  }

  /*
   * ============================================================
   * HISTORIAL
   * ============================================================
   */

  verHistorial(
    periodo: PeriodoCarrera,
  ): void {
    this.seleccionarPeriodo(
      periodo,
    );

    this.mostrarHistorial =
      true;

    this.cargandoHistorial =
      true;

    this.cierrePeriodoService
      .obtenerHistorial(
        periodo.idPeriodoCarrera,
      )
      .subscribe({
        next: (historial) => {
          this.historial =
            historial;

          this.cargandoHistorial =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.cargandoHistorial =
            false;

          this.mostrarHistorial =
            false;

          this.mostrarError(
            error,
            'No fue posible obtener el historial del período.',
          );
        },
      });
  }

  /*
   * ============================================================
   * REASIGNACIÓN
   * ============================================================
   */

  abrirReasignacion(
    periodo: PeriodoCarrera,
  ): void {
    this.seleccionarPeriodo(
      periodo,
    );

    this.idNuevoCoordinador =
      null;

    this.motivoReasignacion =
      '';

    this.mostrarReasignacion =
      true;

    this.cargandoCoordinadores =
      true;

    this.cierrePeriodoService
      .obtenerCoordinadoresDisponibles(
        periodo.idPeriodoCarrera,
      )
      .subscribe({
        next: (coordinadores) => {
          this.coordinadores =
            coordinadores;

          this.cargandoCoordinadores =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.cargandoCoordinadores =
            false;

          this.mostrarReasignacion =
            false;

          this.mostrarError(
            error,
            'No fue posible cargar los coordinadores disponibles.',
          );
        },
      });
  }

  confirmarReasignacion(): void {
    if (
      !this.periodoSeleccionado ||
      !this.idNuevoCoordinador
    ) {
      return;
    }

    this.reasignando = true;

    this.error = '';
    this.mensaje = '';

    this.cierrePeriodoService
      .reasignarCoordinador(
        this.periodoSeleccionado
          .idPeriodoCarrera,
        {
          idNuevoCoordinador:
            Number(
              this.idNuevoCoordinador,
            ),

          motivo:
            this.motivoReasignacion
              .trim() ||
            undefined,
        },
      )
      .subscribe({
        next: (respuesta) => {
          this.reasignando =
            false;

          this.mostrarReasignacion =
            false;

          this.mensaje =
            respuesta.mensaje;

          this.periodoSeleccionado =
            null;

          this.resumen = null;
          this.historial = [];

          this.cargarPeriodos();

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.reasignando =
            false;

          this.mostrarError(
            error,
            'No fue posible cambiar el coordinador.',
          );
        },
      });
  }

  /*
   * ============================================================
   * CIERRE
   * ============================================================
   */

  pedirConfirmacion(): void {
    if (
      !this.periodoSeleccionado ||
      !this.resumen?.puedeCerrar
    ) {
      return;
    }

    this.mostrarConfirmacion =
      true;
  }

  cancelarCierre(): void {
    if (
      this.cerrando
    ) {
      return;
    }

    this.mostrarConfirmacion =
      false;
  }

  confirmarCierre(): void {
    if (
      !this.periodoSeleccionado ||
      !this.resumen?.puedeCerrar
    ) {
      return;
    }

    this.cerrando = true;

    this.mensaje = '';
    this.error = '';

    this.cierrePeriodoService
      .cerrarPeriodo(
        this.periodoSeleccionado
          .idPeriodoCarrera,
        {
          confirmacion:
            'CERRAR',

          motivo:
            'Finalización manual del período académico',
        },
      )
      .subscribe({
        next: (respuesta) => {
          this.cerrando =
            false;

          this.mostrarConfirmacion =
            false;

          this.mensaje =
            respuesta.mensaje;

          if (
            this.periodoSeleccionado
          ) {
            this.periodoSeleccionado
              .estado =
              this.ESTADOS
                .FINALIZADO;

            this.periodoSeleccionado
              .fechaCierre =
              respuesta.fechaCierre;
          }

          this.resumen = null;

          this.cargarPeriodos();

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.cerrando =
            false;

          this.mostrarConfirmacion =
            false;

          this.mostrarError(
            error,
            'No fue posible cerrar el período académico.',
          );
        },
      });
  }

  puedeCerrar(
    periodo: PeriodoCarrera,
  ): boolean {
    return (
      periodo.estado ===
        this.ESTADOS.ACTIVO &&

      this.resumen
        ?.idPeriodoCarrera ===
        periodo.idPeriodoCarrera &&

      this.resumen
        .puedeCerrar
    );
  }

  /*
   * ============================================================
   * CERRAR MODALES
   * ============================================================
   */

  cerrarModalHistorial():
    void {
    this.mostrarHistorial =
      false;
  }

  cerrarModalReasignacion():
    void {
    if (
      this.reasignando
    ) {
      return;
    }

    this.mostrarReasignacion =
      false;
  }

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  private crearFormularioInicial():
    FormularioCrearPeriodo {
    const anioActual =
      new Date().getFullYear();

    return {
      anio:
        anioActual,

      numeroPeriodo:
        '1P',

      idCarrera:
        null,

      idCoordinador:
        null,

      nombrePeriodo:
        '',

      fechaInicio:
        '',

      fechaFin:
        '',

      fechaInicioAporte1:
        '',

      fechaFinAporte1:
        '',

      fechaInicioAporte2:
        '',

      fechaFinAporte2:
        '',

      fechaInicioSupletorio:
        '',

      fechaFinSupletorio:
        '',

      fechaInicioFaseTeorica:
        '',

      fechaFinFaseTeorica:
        '',

      fechaInicioFasePractica:
        '',

      fechaFinFasePractica:
        '',
    };
  }

  private convertirFechaLocal(
    valor: string,
  ): Date | null {
    if (
      !valor
    ) {
      return null;
    }

    const fecha =
      new Date(
        `${valor}T00:00:00`,
      );

    if (
      Number.isNaN(
        fecha.getTime(),
      )
    ) {
      return null;
    }

    return fecha;
  }

  private agregarFechaOpcional(
    dto:
      CrearPeriodoCarreraRequest,

    propiedad:
      | 'fechaInicioAporte1'
      | 'fechaFinAporte1'
      | 'fechaInicioAporte2'
      | 'fechaFinAporte2'
      | 'fechaInicioSupletorio'
      | 'fechaFinSupletorio'
      | 'fechaInicioFaseTeorica'
      | 'fechaFinFaseTeorica'
      | 'fechaInicioFasePractica'
      | 'fechaFinFasePractica',

    valor:
      string,
  ): void {
    const fecha =
      valor.trim();

    if (
      fecha
    ) {
      dto[propiedad] =
        fecha;
    }
  }

  private obtenerMensajeError(
    error: any,
    mensajePredeterminado: string,
  ): string {
    const mensajeBackend =
      error?.error?.message;

    if (Array.isArray(mensajeBackend)) {
      return mensajeBackend.join(' ');
    }

    if (typeof mensajeBackend === 'string') {
      return mensajeBackend;
    }

    return mensajePredeterminado;
  }

  private mostrarError(
    error: any,
    mensajePredeterminado:
      string,
  ): void {
    const mensajeBackend =
      error?.error?.message;

    if (
      Array.isArray(
        mensajeBackend,
      )
    ) {
      this.error =
        mensajeBackend.join(
          ' ',
        );
    } else if (
      typeof mensajeBackend ===
      'string'
    ) {
      this.error =
        mensajeBackend;
    } else {
      this.error =
        mensajePredeterminado;
    }

    console.error(error);

    this.cdr.detectChanges();
  }
}