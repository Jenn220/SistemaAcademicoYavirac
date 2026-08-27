import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RegistroAsistenciaTutorService } from '../../../services/registro-asistencia-tutor.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AsistenciaTutorResponse, AsistenciaTutor, CreateAsistenciaTutorDto, UpdateAsistenciaTutorDto } from '../../../models/registro-asistencia-tutor.model';
import { finalize } from 'rxjs/operators';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';
import { ExcelExportService } from '../../../services/excel-export.service';

@Component({
  selector: 'app-registro-asistencia-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule, VolverArchivosComponent],
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

  // Edición de actividades (SOLO DOCENTE)
  editandoId: number | null = null;
  editandoActividad: UpdateAsistenciaTutorDto = {};

  // Observaciones - auto-guardado (SOLO DOCENTE y TUTOR_EMPRESARIAL)
  observacionEdit: string = '';
  observacionOriginal: string = '';
  guardandoObservacion: boolean = false;
  observacionGuardada: boolean = true;
  timeoutGuardado: any = null;
  mensajeFeedback: string = '';
  editandoObservacion = false;

  // Nueva actividad (SOLO DOCENTE)
  nuevaActividad: CreateAsistenciaTutorDto = {
    id_vinculacion: 0,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    actividad_realizada: '',
    observaciones: ''
  };
  mostrandoFormulario = false;

  // ✅ GETTERS CORREGIDOS
  // SOLO DOCENTE puede editar actividades (EL ESTUDIANTE NO)
  get puedeEditarActividades(): boolean {
    return this.isDocente;
  }

  // DOCENTE y TUTOR_EMPRESARIAL pueden editar observaciones
  get puedeEditarObservaciones(): boolean {
    return this.isDocente || this.isTutorEmpresarial;
  }

  // ✅ ESTUDIANTE solo puede ver (modo lectura)
  get esSoloLectura(): boolean {
    return this.isEstudiante;
  }

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');
    this.isCoordinador = roles.includes('COORDINADOR');
    this.isTutorEmpresarial = roles.includes('TUTOR_EMPRESARIAL');

    if (this.isCoordinador && !this.isDocente) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo Coordinadores con rol de Docente pueden acceder.';
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
        this.error = 'Debe seleccionar un estudiante primero.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

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
            this.error = 'No se encontró una vinculación activa para este estudiante.';
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
          this.cdr.markForCheck();
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.errorHora = null;
    this.cdr.markForCheck();
    console.log('🔵 Cargando Registro Asistencia Tutor para vinculación:', this.idVinculacion);
    
    console.log('🔵 Cargando fechas del proyecto para ID:', this.idVinculacion);

    this.inicioActividadesService.obtenerInicioActividades(this.idVinculacion)
      .subscribe({
        next: (data) => {
          console.log('📦 Fechas del proyecto recibidas:', data);
          console.log('📅 fecha_inicio recibida:', data.fecha_inicio);
          console.log('📅 fecha_fin recibida:', data.fecha_fin);
          
          this.fechaInicioProyecto = data.fecha_inicio || '';
          this.fechaFinProyecto = data.fecha_fin || '';
          
          console.log('✅ fechaInicioProyecto asignada:', this.fechaInicioProyecto);
          console.log('✅ fechaFinProyecto asignada:', this.fechaFinProyecto);
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al obtener fechas del proyecto:', err);
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
          console.log('📦 Datos de Asistencia Tutor recibidos:', data);
          this.data = data;
          this.observacionEdit = data.totales.observaciones || '';
          this.observacionOriginal = this.observacionEdit;
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Asistencia Tutor:', err);
          this.error = 'No se pudo cargar el registro de asistencia del tutor.';
          this.cdr.markForCheck();
        }
      });
  }

  validarFecha(fecha: string): boolean {
    if (!this.fechaInicioProyecto || !this.fechaFinProyecto) {
      console.warn('⚠️ No hay fechas de proyecto para validar');
      return true;
    }

    const fechaActividad = new Date(fecha);
    const fechaInicio = new Date(this.fechaInicioProyecto);
    const fechaFin = new Date(this.fechaFinProyecto);

    fechaActividad.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaActividad < fechaInicio) {
      alert(`❌ La fecha no puede ser anterior a ${this.formatearFecha(this.fechaInicioProyecto)}`);
      return false;
    }

    if (fechaActividad > fechaFin) {
      alert(`❌ La fecha no puede ser posterior a ${this.formatearFecha(this.fechaFinProyecto)}`);
      return false;
    }

    return true;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      console.log('🔍 Formateando fecha:', fecha);
      
      let fechaStr = fecha;
      if (fecha.includes('T')) {
        fechaStr = fecha.split('T')[0];
      }
      
      const date = new Date(fechaStr + 'T00:00:00');
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida:', fecha);
        return fecha;
      }
      
      const fechaFormateada = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      console.log('✅ Fecha formateada:', fechaFormateada);
      return fechaFormateada;
    } catch (error) {
      console.error('❌ Error al formatear fecha:', error);
      return fecha;
    }
  }

  // ============================================
  // OBSERVACIONES - AUTO-GUARDADO (SOLO DOCENTE Y TUTOR_EMPRESARIAL)
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
          console.log('✅ Observación guardada automáticamente');
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
          console.error('❌ Error al guardar observación:', err);
          this.error = 'Error al guardar la observación.';
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
        },
        error: (err) => {
          console.error('❌ Error al agregar actividad:', err);
          
          let mensaje = err.error?.message || err.message || 'Error al agregar actividad.';
          
          console.log('📩 Mensaje de error recibido:', mensaje);
          
          if (mensaje.includes('Ya existe un registro') || mensaje.includes('duplicada') || mensaje.includes('fecha')) {
            this.errorHora = '⚠️ ' + mensaje;
          } else {
            this.error = mensaje;
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
        },
        error: (err) => {
          console.error('❌ Error al actualizar actividad:', err);
          
          let mensaje = err.error?.message || err.message || 'Error al actualizar actividad.';
          
          if (mensaje.includes('Ya existe un registro') || mensaje.includes('duplicada') || mensaje.includes('fecha')) {
            this.errorHora = '⚠️ ' + mensaje;
          } else {
            this.error = mensaje;
          }
          
          this.cdr.markForCheck();
        }
      });
  }

  eliminarActividad(id: number): void {
    if (!this.puedeEditarActividades) return;
    if (!confirm('¿Está seguro de eliminar esta actividad?')) return;
    
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
        },
        error: (err) => {
          console.error('❌ Error al eliminar actividad:', err);
          this.error = err.error?.message || 'Error al eliminar actividad.';
          this.cdr.markForCheck();
        }
      });
  }

  // ✅ Exportar a Excel (visible para TODOS)
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.data) {
      alert('No hay datos para exportar.');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'R.A.T',
        this.data
      );
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel.');
    }
  }
}