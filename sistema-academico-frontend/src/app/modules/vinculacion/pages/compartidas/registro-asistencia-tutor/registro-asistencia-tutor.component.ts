import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { RegistroAsistenciaTutorService } from '../../../services/registro-asistencia-tutor.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { ExcelExportService } from '../../../services/excel-export.service';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';

// ✅ IMPORTAR MODAL DESDE SHARED
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

import {
  AsistenciaTutorResponse,
  AsistenciaTutor,
  CreateAsistenciaTutorDto,
  UpdateAsistenciaTutorDto
} from '../../../models/registro-asistencia-tutor.model';

@Component({
  selector: 'app-registro-asistencia-tutor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VolverArchivosComponent,
    ModalComponent  // ✅ AGREGADO
  ],
  templateUrl: './registro-asistencia-tutor.component.html',
  styleUrls: ['./registro-asistencia-tutor.component.scss']
})
export class RegistroAsistenciaTutorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(RegistroAsistenciaTutorService);
  private inicioActividadesService = inject(InicioActividadesService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);
  private excelService = inject(ExcelExportService);

  // ============================================
  // ESTADO DEL COMPONENTE
  // ============================================
  data: AsistenciaTutorResponse | null = null;
  loading = true;
  error: string | null = null;
  errorHora: string | null = null;
  idVinculacion: number = 0;

  // Roles
  isEstudiante = false;
  isDocente = false;
  isCoordinador = false;
  isTutorEmpresarial = false;

  // Fechas del proyecto (desde inicio-actividades)
  fechaInicioProyecto: string = '';
  fechaFinProyecto: string = '';

  // ============================================
  // MODAL
  // ============================================
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalButtonText: string = 'Aceptar';
  showConfirmButtons: boolean = false;
  modalConfirmCallback: (() => void) | null = null;
  modalCancelCallback: (() => void) | null = null;
  private actividadAEliminar: number | null = null;

  // ============================================
  // EDICIÓN DE ACTIVIDADES (SOLO DOCENTE)
  // ============================================
  editandoId: number | null = null;
  editandoActividad: UpdateAsistenciaTutorDto = {};

  // ============================================
  // OBSERVACIONES - AUTO-GUARDADO
  // ============================================
  observacionEdit: string = '';
  observacionOriginal: string = '';
  guardandoObservacion: boolean = false;
  observacionGuardada: boolean = true;
  timeoutGuardado: any = null;
  mensajeFeedback: string = '';
  editandoObservacion = false;

  // ============================================
  // NUEVA ACTIVIDAD (SOLO DOCENTE)
  // ============================================
  nuevaActividad: CreateAsistenciaTutorDto = {
    id_vinculacion: 0,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    actividad_realizada: '',
    observaciones: ''
  };
  mostrandoFormulario = false;

  // ============================================
  // GETTERS
  // ============================================
  get puedeEditarActividades(): boolean {
    return this.isDocente;
  }

  get puedeEditarObservaciones(): boolean {
    return this.isDocente || this.isTutorEmpresarial;
  }

  get esSoloLectura(): boolean {
    return this.isEstudiante;
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');
    this.isCoordinador = roles.includes('COORDINADOR');
    this.isTutorEmpresarial = roles.includes('TUTOR_EMPRESARIAL');

    if (this.isCoordinador && !this.isDocente) {
      this.mostrarModal(
        'Permisos insuficientes',
        'No tienes permisos para ver esta pantalla. Solo Coordinadores con rol de Docente pueden acceder.',
        'warning'
      );
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;

      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else if (this.isEstudiante) {
        this.obtenerVinculacionActiva();
      } else if ((this.isDocente || this.isTutorEmpresarial) && idParam === 0) {
        this.mostrarModal('Sin selección', 'Debe seleccionar un estudiante primero.', 'warning');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ============================================
  // MODAL - MÉTODOS
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
  // OBTENER VINCULACIÓN ACTIVA (ESTUDIANTE)
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

  // ============================================
  // CARGAR DATOS
  // ============================================
  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.errorHora = null;
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

    this.service.obtenerReporte(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.observacionEdit = data.totales.observaciones || '';
          this.observacionOriginal = this.observacionEdit;
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar Asistencia Tutor:', err);
          this.mostrarModal('Error', err.error?.message || 'No se pudo cargar el registro de asistencia del tutor.', 'error');
          this.cdr.markForCheck();
        }
      });
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
    if (this.observacionEdit === this.observacionOriginal) {
      this.observacionGuardada = true;
      this.editandoObservacion = false;
      this.cdr.markForCheck();
      return;
    }

    this.guardandoObservacion = true;
    this.observacionGuardada = false;
    this.cdr.markForCheck();

    this.service.actualizarObservacion(this.idVinculacion, this.observacionEdit)
      .pipe(finalize(() => {
        this.guardandoObservacion = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.observacionOriginal = this.observacionEdit;
          this.observacionGuardada = true;

          if (this.data) {
            this.data.totales.observaciones = this.observacionEdit;
          }

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

  mostrarFeedback(mensaje: string): void {
    this.mensajeFeedback = mensaje;
    setTimeout(() => {
      this.mensajeFeedback = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  toggleEditObservacion(): void {
    if (!this.puedeEditarObservaciones) return;
    if (this.editandoObservacion) {
      this.guardarObservacion();
    } else {
      this.editandoObservacion = true;
      this.observacionEdit = this.data?.totales.observaciones || '';
      this.observacionOriginal = this.observacionEdit;
      this.cdr.markForCheck();
    }
  }

  // ============================================
  // CRUD ACTIVIDADES (SOLO DOCENTE)
  // ============================================
  mostrarFormulario(): void {
    if (!this.puedeEditarActividades) return;
    this.mostrandoFormulario = true;
    this.errorHora = null;
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    this.nuevaActividad = {
      id_vinculacion: this.idVinculacion,
      fecha: fechaStr,
      hora_inicio: '',
      hora_fin: '',
      actividad_realizada: '',
      observaciones: ''
    };
    this.cdr.markForCheck();
  }

  cancelarNuevo(): void {
    this.mostrandoFormulario = false;
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  agregarActividad(): void {
    if (!this.puedeEditarActividades) return;
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

    this.loading = true;
    this.cdr.markForCheck();

    this.service.crearAsistencia(this.nuevaActividad)
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

  editarActividad(act: AsistenciaTutor): void {
    if (!this.puedeEditarActividades) return;
    this.editandoId = act.id;
    this.errorHora = null;
    this.editandoActividad = {
      fecha: act.fecha,
      hora_inicio: act.hora_entrada,
      hora_fin: act.hora_salida,
      actividad_realizada: act.actividad_realizada
    };
    this.cdr.markForCheck();
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  guardarEdicion(): void {
    if (!this.puedeEditarActividades || !this.editandoId) return;
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

    this.service.actualizarAsistencia(this.editandoId, this.editandoActividad)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.cancelarEdicion();
          this.mostrarModal('Éxito', 'Actividad actualizada correctamente.', 'success');
        },
        error: (err) => {
          console.error('Error al actualizar actividad:', err);

          const mensaje = err.error?.message || err.message || 'Error al actualizar actividad.';

          if (mensaje.includes('Ya existe') || mensaje.includes('duplicada') || mensaje.includes('fecha')) {
            this.errorHora = '⚠️ ' + mensaje;
          } else {
            this.mostrarModal('Error', mensaje, 'error');
          }

          this.cdr.markForCheck();
        }
      });
  }

  eliminarActividad(id: number): void {
    if (!this.puedeEditarActividades) return;

    this.actividadAEliminar = id;

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

    this.service.eliminarAsistencia(id)
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
  // EXPORTAR A EXCEL (VISIBLE PARA TODOS)
  // ============================================
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.data) {
      this.mostrarModal('Sin datos', 'No hay datos para exportar.', 'warning');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'R.A.T',
        this.data
      );
      this.mostrarModal('Éxito', 'Archivo Excel exportado correctamente.', 'success');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.mostrarModal('Error', 'Error al exportar el archivo Excel.', 'error');
    }
  }
}