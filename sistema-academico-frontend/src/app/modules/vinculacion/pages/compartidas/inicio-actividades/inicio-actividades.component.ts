import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { ExcelExportService } from '../../../services/excel-export.service';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';

// ✅ IMPORTAR MODAL DESDE SHARED
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

import { InicioActividadesResponse } from '../../../models';

@Component({
  selector: 'app-inicio-actividades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VolverArchivosComponent,
    ModalComponent  // ✅ AGREGADO
  ],
  templateUrl: './inicio-actividades.component.html',
  styleUrls: ['./inicio-actividades.component.scss']
})
export class InicioActividadesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InicioActividadesService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);
  private excelService = inject(ExcelExportService);

  // Datos principales
  data: InicioActividadesResponse | null = null;
  idVinculacion: number = 0;

  // Fecha actual
  fechaActual: string = '';

  // Estados
  isLoading = true;
  error: string | null = null;

  // Roles
  isEstudiante = false;
  isDocente = false;

  // Edición
  editMode = false;

  // 🔥 Getter que usa el campo editado del backend
  get isEditingEnabled(): boolean {
    return this.isDocente && this.data !== null && !this.data.editado;
  }

  editedFields = {
    nombre_proyecto: '',
    fecha_inicio: '',
    fecha_fin: ''
  };

  // ============================================
  // MODAL
  // ============================================
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';

  ngOnInit(): void {
    // Asignar fecha actual
    this.fechaActual = this.obtenerFechaActual();

    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');

    const puedeVer = this.isEstudiante || this.isDocente;
    if (!puedeVer) {
      this.mostrarModal('Permisos insuficientes', 'No tienes permisos para ver esta pantalla.', 'warning');
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    const idParam = this.route.snapshot.params['id'];
    if (idParam && idParam > 0) {
      this.idVinculacion = Number(idParam);
      this.cargarDatos();
    } else {
      this.obtenerVinculacionActiva();
    }
  }

  // ============================================
  // OBTENER FECHA ACTUAL
  // ============================================
  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // ============================================
  // MODAL
  // ============================================
  private mostrarModal(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.cdr.markForCheck();
  }

  // ============================================
  // OBTENER VINCULACIÓN ACTIVA
  // ============================================
  obtenerVinculacionActiva(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.isLoading = false;
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
        error: (err: any) => {
          console.error('Error al obtener vinculación activa:', err);
          this.mostrarModal('Error', err.error?.message || err.message || 'Error al obtener la vinculación activa.', 'error');
        }
      });
  }

  // ============================================
  // CARGAR DATOS
  // ============================================
  cargarDatos(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.service.obtenerInicioActividades(this.idVinculacion)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          this.data = response;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error al cargar Inicio Actividades:', err);
          this.mostrarModal('Error', err.error?.message || err.message || 'No se pudieron cargar los datos.', 'error');
        }
      });
  }

  // ============================================
  // ACTIVAR EDICIÓN
  // ============================================
  activarEdicion(): void {
    if (!this.isEditingEnabled) {
      this.mostrarModal('No permitido', 'Este proyecto ya fue editado anteriormente. No se permiten más modificaciones.', 'warning');
      return;
    }

    if (!this.isDocente || !this.data) {
      return;
    }

    this.editMode = true;
    this.editedFields = {
      nombre_proyecto: this.data.proyecto_nombre || '',
      fecha_inicio: this.data.fecha_inicio ? this.data.fecha_inicio.split('T')[0] : '',
      fecha_fin: this.data.fecha_fin ? this.data.fecha_fin.split('T')[0] : ''
    };
    this.cdr.markForCheck();
  }

  // ============================================
  // CANCELAR EDICIÓN
  // ============================================
  cancelarEdicion(): void {
    this.editMode = false;
    this.cdr.markForCheck();
  }

  // ============================================
  // VALIDAR CAMBIOS
  // ============================================
  validarCambios(): boolean {
    if (!this.editedFields.nombre_proyecto?.trim()) {
      this.mostrarModal('Campo requerido', 'El nombre del proyecto es obligatorio.', 'warning');
      return false;
    }

    if (!this.editedFields.fecha_inicio) {
      this.mostrarModal('Campo requerido', 'La fecha de inicio es obligatoria.', 'warning');
      return false;
    }

    if (!this.editedFields.fecha_fin) {
      this.mostrarModal('Campo requerido', 'La fecha de finalización es obligatoria.', 'warning');
      return false;
    }

    const fechaInicio = new Date(this.editedFields.fecha_inicio + 'T00:00:00');
    const fechaFin = new Date(this.editedFields.fecha_fin + 'T00:00:00');

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      this.mostrarModal('Fecha inválida', 'Las fechas no son válidas.', 'warning');
      return false;
    }

    if (fechaFin.getTime() <= fechaInicio.getTime()) {
      this.mostrarModal('Fecha inválida', 'La fecha de finalización debe ser posterior a la fecha de inicio.', 'warning');
      return false;
    }

    return true;
  }

  // ============================================
  // GUARDAR CAMBIOS
  // ============================================
  guardarCambios(): void {
    if (!this.validarCambios()) {
      return;
    }

    if (!this.isEditingEnabled) {
      this.mostrarModal('No permitido', 'Este proyecto ya fue editado anteriormente. No se permiten más modificaciones.', 'warning');
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const payload = {
      nombre_proyecto: this.editedFields.nombre_proyecto.trim(),
      fecha_inicio: this.editedFields.fecha_inicio,
      fecha_fin: this.editedFields.fecha_fin
    };

    this.service.actualizarInicioActividades(this.idVinculacion, payload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response: any) => {
          this.editMode = false;
          const mensaje = response?.message || 'Los cambios se guardaron correctamente.';
          this.mostrarModal('Guardado', mensaje, 'success');
          this.cargarDatos();
        },
        error: (err: any) => {
          console.error('Error al guardar cambios:', err);
          const mensajeError = err.error?.message || err.message || 'Error al guardar los cambios. Por favor, intenta nuevamente.';
          this.mostrarModal('Error', mensajeError, 'error');
        }
      });
  }

  // ============================================
  // FORMATEAR FECHA
  // ============================================
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      let fechaStr = fecha;
      if (fecha.includes('T')) {
        fechaStr = fecha.split('T')[0];
      }
      const date = new Date(fechaStr + 'T00:00:00');
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
        'Inicio Act.',
        this.data
      );
      this.mostrarModal('Éxito', 'Archivo Excel exportado correctamente.', 'success');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.mostrarModal('Error', 'Error al exportar el archivo Excel.', 'error');
    }
  }
}