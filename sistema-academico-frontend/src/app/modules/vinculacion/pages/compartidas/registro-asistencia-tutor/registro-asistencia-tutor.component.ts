import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RegistroAsistenciaTutorService } from '../../../services/registro-asistencia-tutor.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AsistenciaTutorResponse, AsistenciaTutor, CreateAsistenciaTutorDto, UpdateAsistenciaTutorDto } from '../../../models/registro-asistencia-tutor.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-registro-asistencia-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-asistencia-tutor.component.html',
  styleUrls: ['./registro-asistencia-tutor.component.scss']
})
export class RegistroAsistenciaTutorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(RegistroAsistenciaTutorService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);

  data: AsistenciaTutorResponse | null = null;
  loading = true;
  error: string | null = null;
  idVinculacion: number = 0;

  // Roles
  isEstudiante = false;
  isDocente = false;
  isCoordinador = false;
  isTutorEmpresarial = false;

  // Variables para edición
  editandoId: number | null = null;
  editandoActividad: UpdateAsistenciaTutorDto = {};

  // Observaciones (SOLO DOCENTE puede editar)
  observacionEdit: string = '';
  editandoObservacion = false;

  // Nueva actividad (ESTUDIANTE puede crear)
  nuevaActividad: CreateAsistenciaTutorDto = {
    id_vinculacion: 0,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    actividad_realizada: '',
    observaciones: ''
  };
  mostrandoFormulario = false;

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');
    this.isCoordinador = roles.includes('COORDINADOR');
    this.isTutorEmpresarial = roles.includes('TUTOR_EMPRESARIAL');

    // Si es COORDINADOR, no puede ver esta pantalla
    if (this.isCoordinador) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla.';
      this.loading = false;
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else if (this.isEstudiante) {
        // ✅ Si es estudiante y no viene ID, obtener vinculación activa
        this.obtenerVinculacionActiva();
      } else if (this.isDocente && idParam === 0) {
        // Si es docente y no viene ID, mostrar error
        this.error = 'Debe seleccionar un estudiante primero.';
        this.loading = false;
      }
    });
  }

  /**
   * ✅ Obtener vinculación activa del estudiante autenticado
   */
  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();
          } else {
            this.error = 'No se encontró una vinculación activa para este estudiante.';
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    console.log('🔵 Cargando Registro Asistencia Tutor para vinculación:', this.idVinculacion);
    
    this.service.obtenerReporte(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de Asistencia Tutor recibidos:', data);
          this.data = data;
          this.observacionEdit = data.totales.observaciones || '';
        },
        error: (err) => {
          console.error('❌ Error al cargar Asistencia Tutor:', err);
          this.error = 'No se pudo cargar el registro de asistencia del tutor.';
        }
      });
  }

  // ========== CRUD ACTIVIDADES (SOLO ESTUDIANTE) ==========
  mostrarFormulario(): void {
    if (!this.isEstudiante) return;
    this.mostrandoFormulario = true;
    this.nuevaActividad = {
      id_vinculacion: this.idVinculacion,
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      actividad_realizada: '',
      observaciones: ''
    };
  }

  cancelarNuevo(): void {
    this.mostrandoFormulario = false;
  }

  agregarActividad(): void {
    if (!this.isEstudiante) return;
    if (!this.nuevaActividad.fecha || !this.nuevaActividad.hora_inicio || !this.nuevaActividad.hora_fin) {
      alert('Complete fecha, hora entrada y salida.');
      return;
    }
    this.loading = true;
    this.service.crearAsistencia(this.nuevaActividad)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrandoFormulario = false;
        },
        error: (err) => {
          console.error('❌ Error al agregar actividad:', err);
          this.error = 'Error al agregar actividad.';
        }
      });
  }

  editarActividad(act: AsistenciaTutor): void {
    if (!this.isEstudiante) return;
    this.editandoId = act.id;
    this.editandoActividad = {
      fecha: act.fecha,
      hora_inicio: act.hora_entrada,
      hora_fin: act.hora_salida,
      actividad_realizada: act.actividad_realizada
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
  }

  guardarEdicion(): void {
    if (!this.isEstudiante || !this.editandoId) return;
    this.loading = true;
    this.service.actualizarAsistencia(this.editandoId, this.editandoActividad)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.cancelarEdicion();
        },
        error: (err) => {
          console.error('❌ Error al actualizar actividad:', err);
          this.error = 'Error al actualizar actividad.';
        }
      });
  }

  eliminarActividad(id: number): void {
    if (!this.isEstudiante) return;
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.loading = true;
    this.service.eliminarAsistencia(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          console.error('❌ Error al eliminar actividad:', err);
          this.error = 'Error al eliminar actividad.';
        }
      });
  }

  // ========== OBSERVACIONES (SOLO DOCENTE) ==========
  toggleEditObservacion(): void {
    if (!this.isDocente) return;
    this.editandoObservacion = !this.editandoObservacion;
    if (!this.editandoObservacion && this.data) {
      alert('Observación guardada localmente. (Endpoint pendiente para guardar en BD)');
    }
  }
}