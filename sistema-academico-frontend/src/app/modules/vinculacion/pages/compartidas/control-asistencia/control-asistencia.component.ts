import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ControlAsistenciaService } from '../../../services/control-asistencia.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { ExcelExportService } from '../../../services/excel-export.service';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';

// ✅ IMPORTAR MODAL DESDE SHARED
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

import {
  AsistenciaEstudianteResponse,
  ActividadEstudiante,
  CreateActividadEstudianteDto,
  UpdateActividadEstudianteDto,
  ActividadAgrupada
} from '../../../models/control-asistencia.model';

@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VolverArchivosComponent,
    ModalComponent  // ✅ AGREGADO
  ],
  templateUrl: './control-asistencia.component.html',
  styleUrls: ['./control-asistencia.component.scss']
})
export class ControlAsistenciaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private asistenciaService = inject(ControlAsistenciaService);
  private inicioActividadesService = inject(InicioActividadesService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);
  private excelService = inject(ExcelExportService);

  // ============================================
  // ESTADO DEL COMPONENTE
  // ============================================
  data: AsistenciaEstudianteResponse | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  isDocente = false;
  isCoordinador = false;
  idVinculacion: number = 0;

  fechaInicioProyecto: string = '';
  fechaFinProyecto: string = '';

  // ============================================
  // OBSERVACIONES
  // ============================================
  observaciones: string = '';
  observacionesOriginales: string = '';
  guardandoObservacion: boolean = false;
  observacionGuardada: boolean = true;
  timeoutGuardado: any = null;
  mensajeFeedback: string = '';
  editandoObservacion = false;

  // ============================================
  // ERRORES Y MODAL
  // ============================================
  errorHora: string | null = null;

  // Modal
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalButtonText: string = 'Aceptar';
  modalConfirmCallback: (() => void) | null = null;
  modalCancelCallback: (() => void) | null = null;
  showConfirmButtons: boolean = false;

  // ============================================
  // ACTIVIDADES AGRUPADAS
  // ============================================
  actividadesAgrupadas: ActividadAgrupada[] = [];

  // ============================================
  // NUEVA ACTIVIDAD
  // ============================================
  nuevaActividad: CreateActividadEstudianteDto = {
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    actividades_realizadas: '',
    observacion: '',
    resultado_aprendizaje: ''
  };
  mostrandoFormulario = false;

  // ============================================
  // EDICIÓN
  // ============================================
  editandoId: number | null = null;
  editandoActividad: UpdateActividadEstudianteDto = {};
  editandoGrupoId: number | null = null;
  descripcionGrupoOriginal: string = '';

  // ============================================
  // DUPLICAR ACTIVIDAD
  // ============================================
  mostrandoModalDuplicar = false;
  actividadParaDuplicar: ActividadEstudiante | null = null;
  nuevoDiaDuplicado = {
    fecha: '',
    hora_inicio: '08:00',
    hora_fin: '12:00'
  };

  // Variable para guardar el ID a eliminar
  private actividadAEliminar: number | null = null;

  // ============================================
  // GETTERS
  // ============================================
  get puedeEditarObservaciones(): boolean {
    return this.isDocente || this.isCoordinador;
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');
    this.isCoordinador = roles.includes('COORDINADOR');

    if (this.isDocente || this.isCoordinador) {
      this.route.params.subscribe(params => {
        const idParam = params['id'] ? +params['id'] : 0;
        if (idParam > 0) {
          this.idVinculacion = idParam;
          this.cargarDatosCompletosDocente();
        } else {
          this.mostrarModal('Error', 'No se encontró el ID de vinculación.', 'error');
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
      return;
    }

    if (!this.isEstudiante) {
      this.mostrarModal('Permisos insuficientes', 'No tienes permisos para ver esta pantalla.', 'warning');
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else {
        this.obtenerVinculacionActiva();
      }
    });
  }

  // ============================================
  // MODAL - MÉTODOS MEJORADOS
  // ============================================
  private mostrarModal(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttonText: string = 'Aceptar'
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalButtonText = buttonText;
    this.showConfirmButtons = false;
    this.modalConfirmCallback = null;
    this.modalCancelCallback = null;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  private mostrarModalConfirmacion(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'warning';
    this.modalButtonText = 'Confirmar';
    this.showConfirmButtons = true;
    this.modalConfirmCallback = onConfirm;
    this.modalCancelCallback = onCancel || null;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.showConfirmButtons = false;
    this.modalConfirmCallback = null;
    this.modalCancelCallback = null;
    this.cdr.markForCheck();
  }

  confirmarModal(): void {
    if (this.modalConfirmCallback) {
      this.modalConfirmCallback();
    }
    this.cerrarModal();
  }

  cancelarModal(): void {
    if (this.modalCancelCallback) {
      this.modalCancelCallback();
    }
    this.cerrarModal();
  }

  // ============================================
  // CARGA DE DATOS PARA DOCENTE
  // ============================================
  cargarDatosCompletosDocente(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.inicioActividadesService.obtenerInicioActividades(this.idVinculacion)
      .subscribe({
        next: (data) => {
          this.fechaInicioProyecto = data.fecha_inicio || '';
          this.fechaFinProyecto = data.fecha_fin || '';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al obtener fechas del proyecto:', err);
          this.fechaInicioProyecto = '';
          this.fechaFinProyecto = '';
          this.cdr.markForCheck();
        }
      });

    this.asistenciaService.obtenerAsistencia(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.procesarActividadesAgrupadas();
          this.observaciones = data.totales?.observaciones || '';
          this.observacionesOriginales = this.observaciones;
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar asistencia:', err);
          this.mostrarModal('Error', err.error?.message || 'No se pudo cargar el control de asistencia.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // CARGA DE DATOS PARA ESTUDIANTE
  // ============================================
  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();
          } else {
            this.mostrarModal('Sin vinculación', 'No se encontró una vinculación activa para este estudiante.', 'warning');
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Error al obtener vinculación activa:', err);
          this.mostrarModal('Error', err.error?.message || 'Error al obtener la vinculación activa.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.inicioActividadesService.obtenerInicioActividades(this.idVinculacion)
      .subscribe({
        next: (data) => {
          this.fechaInicioProyecto = data.fecha_inicio || '';
          this.fechaFinProyecto = data.fecha_fin || '';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al obtener fechas del proyecto:', err);
          this.fechaInicioProyecto = '';
          this.fechaFinProyecto = '';
          this.cdr.markForCheck();
        }
      });

    this.asistenciaService.obtenerAsistencia(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.procesarActividadesAgrupadas();
          this.observaciones = data.totales?.observaciones || '';
          this.observacionesOriginales = this.observaciones;
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar asistencia:', err);
          this.mostrarModal('Error', err.error?.message || 'No se pudo cargar el control de asistencia.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // LÓGICA DE AGRUPACIÓN DE ACTIVIDADES
  // ============================================
  procesarActividadesAgrupadas(): void {
    if (!this.data || !this.data.actividades) {
      this.actividadesAgrupadas = [];
      return;
    }

    const mapa = new Map<string, ActividadAgrupada>();

    this.data.actividades.forEach(act => {
      const clave = act.descripcion.trim().toLowerCase();

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          ids: [act.id],
          fechas: [act.fecha],
          textoFechas: this.formatearFecha(act.fecha),
          hora_entrada: act.hora_entrada,
          hora_salida: act.hora_salida,
          total_horas: Number(act.total_horas) || 0,
          descripcion: act.descripcion,
          actividadRepresentativa: act,
          actividadesDetalle: [act]
        });
      } else {
        const grupo = mapa.get(clave)!;
        grupo.ids.push(act.id);
        grupo.fechas.push(act.fecha);
        grupo.total_horas += Number(act.total_horas) || 0;
        grupo.actividadesDetalle.push(act);
        grupo.actividadesDetalle.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        grupo.fechas.sort();
        const fechaInicio = this.formatearFecha(grupo.fechas[0]);
        const fechaFin = this.formatearFecha(grupo.fechas[grupo.fechas.length - 1]);

        if (grupo.fechas.length === 1) {
          grupo.textoFechas = fechaInicio;
        } else {
          grupo.textoFechas = `${fechaInicio} al ${fechaFin} (${grupo.fechas.length} días)`;
        }
      }
    });

    this.actividadesAgrupadas = Array.from(mapa.values());
  }

  // ============================================
  // VALIDACIONES
  // ============================================
  validarFecha(fecha: string): boolean {
    if (!this.fechaInicioProyecto || !this.fechaFinProyecto) {
      return true;
    }

    const fechaActividad = new Date(fecha);
    const fechaInicio = new Date(this.fechaInicioProyecto);
    const fechaFin = new Date(this.fechaFinProyecto);

    fechaActividad.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaActividad < fechaInicio) {
      this.mostrarModal('Fecha inválida', `La fecha no puede ser anterior a ${this.formatearFecha(this.fechaInicioProyecto)}`, 'warning');
      return false;
    }

    if (fechaActividad > fechaFin) {
      this.mostrarModal('Fecha inválida', `La fecha no puede ser posterior a ${this.formatearFecha(this.fechaFinProyecto)}`, 'warning');
      return false;
    }

    return true;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      let fechaStr = fecha;
      if (fecha.includes('T')) {
        fechaStr = fecha.split('T')[0];
      }
      const date = new Date(fechaStr + 'T00:00:00');
      if (isNaN(date.getTime())) return fecha;
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  // ============================================
  // OBSERVACIONES - AUTO-GUARDADO
  // ============================================
  onObservacionChange(): void {
    if (!this.puedeEditarObservaciones) return;

    if (this.timeoutGuardado) {
      clearTimeout(this.timeoutGuardado);
    }

    this.observacionGuardada = false;

    this.timeoutGuardado = setTimeout(() => {
      this.guardarObservacion();
    }, 1500);
  }

  guardarObservacion(): void {
    if (!this.puedeEditarObservaciones) return;
    if (this.guardandoObservacion) return;
    if (this.observaciones === this.observacionesOriginales) {
      this.observacionGuardada = true;
      this.editandoObservacion = false;
      this.cdr.markForCheck();
      return;
    }

    this.guardandoObservacion = true;
    this.observacionGuardada = false;
    this.cdr.markForCheck();

    this.asistenciaService.actualizarObservacion(this.idVinculacion, this.observaciones)
      .pipe(finalize(() => {
        this.guardandoObservacion = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.observacionesOriginales = this.observaciones;
          this.observacionGuardada = true;
          this.mostrarFeedback('Observación guardada ✅');
          this.editandoObservacion = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al guardar observación:', err);
          this.mostrarModal('Error', err.error?.message || 'Error al guardar la observación.', 'error');
          this.observacionGuardada = false;
          this.cdr.markForCheck();
        }
      });
  }

  toggleEditObservacion(): void {
    if (!this.puedeEditarObservaciones) return;
    if (this.editandoObservacion) {
      this.guardarObservacion();
    } else {
      this.editandoObservacion = true;
      this.observaciones = this.data?.totales?.observaciones || '';
      this.observacionesOriginales = this.observaciones;
      this.cdr.markForCheck();
    }
  }

  mostrarFeedback(mensaje: string): void {
    this.mensajeFeedback = mensaje;
    setTimeout(() => {
      this.mensajeFeedback = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  // ============================================
  // CRUD ACTIVIDADES (SOLO ESTUDIANTE)
  // ============================================
  mostrarFormulario(): void {
    if (!this.isEstudiante) return;
    this.mostrandoFormulario = true;
    this.errorHora = null;
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    this.nuevaActividad = {
      fecha: fechaStr,
      hora_inicio: '',
      hora_fin: '',
      actividades_realizadas: '',
      observacion: '',
      resultado_aprendizaje: ''
    };
    this.cdr.markForCheck();
  }

  cancelarNuevo(): void {
    this.mostrandoFormulario = false;
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  agregarActividad(): void {
    if (!this.isEstudiante) return;
    this.errorHora = null;

    if (!this.nuevaActividad.fecha || !this.nuevaActividad.hora_inicio || !this.nuevaActividad.hora_fin) {
      this.errorHora = '⚠️ Complete fecha, hora entrada y hora salida.';
      this.cdr.markForCheck();
      return;
    }

    if (this.nuevaActividad.hora_fin <= this.nuevaActividad.hora_inicio) {
      this.errorHora = '❌ La hora de salida debe ser posterior a la hora de entrada.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.validarFecha(this.nuevaActividad.fecha)) {
      return;
    }

    const payload = {
      ...this.nuevaActividad,
      id_vinculacion: this.idVinculacion
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.asistenciaService.crearActividad(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrandoFormulario = false;
          this.errorHora = null;
          this.mostrarModal('Éxito', 'Actividad registrada correctamente.', 'success');
        },
        error: (err) => {
          console.error('Error al agregar actividad:', err);
          const mensaje = err.error?.message || err.message || 'Error al agregar actividad.';

          if (mensaje.includes('Ya existe') || mensaje.includes('duplicada') || mensaje.includes('fecha')) {
            this.errorHora = '⚠️ ' + mensaje;
          } else {
            this.mostrarModal('Error', mensaje, 'error');
          }
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // EDICIÓN DE FILAS Y GRUPOS
  // ============================================
  editarFilaIndividual(act: any): void {
    if (!this.isEstudiante) return;
    this.editandoId = act.id;
    this.editandoGrupoId = null;
    this.errorHora = null;

    this.editandoActividad = {
      fecha: act.fecha,
      hora_inicio: act.hora_entrada,
      hora_fin: act.hora_salida,
      actividades_realizadas: act.descripcion
    };
    this.cdr.markForCheck();
  }

  editarDescripcionGrupo(grupo: ActividadAgrupada): void {
    if (!this.isEstudiante) return;
    this.editandoId = null;
    this.editandoGrupoId = grupo.ids[0];
    this.errorHora = null;

    this.editandoActividad = {
      actividades_realizadas: grupo.descripcion
    };
    this.cdr.markForCheck();
  }

  guardarEdicionFila(actId: number): void {
    if (!this.isEstudiante) return;

    this.errorHora = null;

    if (this.editandoActividad.fecha && !this.validarFecha(this.editandoActividad.fecha)) {
      return;
    }

    if (this.editandoActividad.hora_inicio && this.editandoActividad.hora_fin) {
      if (this.editandoActividad.hora_fin <= this.editandoActividad.hora_inicio) {
        this.errorHora = '❌ La hora de salida debe ser posterior a la hora de entrada.';
        this.cdr.markForCheck();
        return;
      }
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.asistenciaService.actualizarActividad(actId, this.editandoActividad).subscribe({
      next: () => {
        this.cargarDatos();
        this.cancelarEdicion();
        this.mostrarModal('Éxito', 'Actividad actualizada correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error al actualizar la actividad:', err);
        this.mostrarModal('Error', err.error?.message || 'Error al actualizar la actividad.', 'error');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  guardarEdicionGrupo(grupo: ActividadAgrupada): void {
    if (!this.isEstudiante || !this.editandoGrupoId) return;

    const nuevaDescripcion = this.editandoActividad.actividades_realizadas;
    if (!nuevaDescripcion || nuevaDescripcion.trim() === '') {
      this.mostrarModal('Campo vacío', 'La descripción no puede estar vacía.', 'warning');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const promesas = grupo.ids.map(id =>
      this.asistenciaService.actualizarActividad(id, { actividades_realizadas: nuevaDescripcion }).toPromise()
    );

    Promise.all(promesas)
      .then(() => {
        this.cargarDatos();
        this.cancelarEdicion();
        this.mostrarModal('Éxito', 'Grupo de actividades actualizado correctamente.', 'success');
      })
      .catch((err) => {
        console.error('Error al actualizar el grupo de actividades:', err);
        this.mostrarModal('Error', err.error?.message || 'Error al actualizar las actividades.', 'error');
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoGrupoId = null;
    this.editandoActividad = {};
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  // ============================================
  // ELIMINAR ACTIVIDAD - CON MODAL DE CONFIRMACIÓN
  // ============================================
  eliminarActividad(id: number): void {
    if (!this.isEstudiante) return;

    // Guardar el ID para usarlo en la confirmación
    this.actividadAEliminar = id;

    // Mostrar modal de confirmación
    this.mostrarModalConfirmacion(
      'Confirmar eliminación',
      '¿Está seguro de eliminar esta actividad? Esta acción no se puede deshacer.',
      () => this.confirmarEliminarActividad(),
      () => { this.actividadAEliminar = null; }
    );
  }

  confirmarEliminarActividad(): void {
    const id = this.actividadAEliminar;
    if (id === null) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.asistenciaService.eliminarActividad(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarModal('Eliminado', 'Actividad eliminada correctamente.', 'success');
          this.actividadAEliminar = null;
        },
        error: (err) => {
          console.error('Error al eliminar actividad:', err);
          this.mostrarModal('Error', err.error?.message || 'Error al eliminar actividad.', 'error');
          this.actividadAEliminar = null;
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // DUPLICAR ACTIVIDAD
  // ============================================
  prepararDuplicado(actividad: ActividadEstudiante): void {
    if (!this.isEstudiante) return;
    this.actividadParaDuplicar = actividad;
    this.errorHora = null;
    this.nuevoDiaDuplicado = {
      fecha: '',
      hora_inicio: actividad.hora_entrada || '08:00',
      hora_fin: actividad.hora_salida || '12:00'
    };
    this.mostrandoModalDuplicar = true;
    this.cdr.markForCheck();
  }

  cancelarDuplicado(): void {
    this.mostrandoModalDuplicar = false;
    this.actividadParaDuplicar = null;
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  guardarDiaDuplicado(): void {
    if (!this.isEstudiante || !this.actividadParaDuplicar) return;
    this.errorHora = null;

    if (!this.nuevoDiaDuplicado.fecha || !this.nuevoDiaDuplicado.hora_inicio || !this.nuevoDiaDuplicado.hora_fin) {
      this.errorHora = '⚠️ Complete la fecha, hora de entrada y hora de salida.';
      this.cdr.markForCheck();
      return;
    }

    if (this.nuevoDiaDuplicado.hora_fin <= this.nuevoDiaDuplicado.hora_inicio) {
      this.errorHora = '❌ La hora de salida debe ser posterior a la hora de entrada.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.validarFecha(this.nuevoDiaDuplicado.fecha)) {
      return;
    }

    const payload: CreateActividadEstudianteDto = {
      fecha: this.nuevoDiaDuplicado.fecha,
      hora_inicio: this.nuevoDiaDuplicado.hora_inicio,
      hora_fin: this.nuevoDiaDuplicado.hora_fin,
      actividades_realizadas: this.actividadParaDuplicar.descripcion,
      observacion: '',
      id_vinculacion: this.idVinculacion
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.asistenciaService.crearActividad(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.cancelarDuplicado();
          this.errorHora = null;
          this.mostrarModal('Éxito', 'Nuevo día registrado correctamente.', 'success');
        },
        error: (err) => {
          console.error('Error al duplicar actividad:', err);
          const mensaje = err.error?.message || err.message || 'Error al duplicar la actividad.';

          if (mensaje.includes('Ya existe') || mensaje.includes('duplicada') || mensaje.includes('fecha')) {
            this.errorHora = '⚠️ ' + mensaje;
          } else {
            this.mostrarModal('Error', mensaje, 'error');
          }
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // EXPORTAR A EXCEL
  // ============================================
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.data) {
      this.mostrarModal('Sin datos', 'No hay datos para exportar.', 'warning');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'C.A.',
        this.data
      );
      this.mostrarModal('Éxito', 'Archivo Excel exportado correctamente.', 'success');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.mostrarModal('Error', 'Error al exportar el archivo Excel.', 'error');
    }
  }

  cargarDatosDocente(): void {
    this.cargarDatosCompletosDocente();
  }
}