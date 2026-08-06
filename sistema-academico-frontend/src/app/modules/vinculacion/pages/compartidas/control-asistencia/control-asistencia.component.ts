import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ControlAsistenciaService } from '../../../services/control-asistencia.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AsistenciaEstudianteResponse, ActividadEstudiante, CreateActividadEstudianteDto, UpdateActividadEstudianteDto } from '../../../models/control-asistencia.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-asistencia.component.html',
  styleUrls: ['./control-asistencia.component.scss']
})
export class ControlAsistenciaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private asistenciaService = inject(ControlAsistenciaService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);

  data: AsistenciaEstudianteResponse | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  nuevaActividad: CreateActividadEstudianteDto = {
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    actividades_realizadas: '',
    observacion: '',
    resultado_aprendizaje: ''
  };
  mostrandoFormulario = false;

  editandoId: number | null = null;
  editandoActividad: UpdateActividadEstudianteDto = {};

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
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
    this.cdr.markForCheck();
    console.log('🔵 Cargando asistencia para vinculación:', this.idVinculacion);
    
    this.asistenciaService.obtenerAsistencia(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de asistencia recibidos:', data);
          this.data = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar asistencia:', err);
          this.error = 'No se pudo cargar el control de asistencia.';
          this.cdr.markForCheck();
        }
      });
  }

  mostrarFormulario(): void {
    this.mostrandoFormulario = true;
    this.nuevaActividad = { 
      fecha: '', 
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
    this.cdr.markForCheck();
  }

  agregarActividad(): void {
    if (!this.nuevaActividad.fecha || !this.nuevaActividad.hora_inicio || !this.nuevaActividad.hora_fin) {
      alert('Complete fecha, hora entrada y salida.');
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
        },
        error: (err) => {
          console.error('❌ Error al agregar actividad:', err);
          this.error = 'Error al agregar actividad.';
          this.cdr.markForCheck();
        }
      });
  }

  editarActividad(actividad: ActividadEstudiante): void {
    this.editandoId = actividad.id;
    this.editandoActividad = {
      fecha: actividad.fecha,
      hora_inicio: actividad.hora_entrada,
      hora_fin: actividad.hora_salida,
      actividades_realizadas: actividad.descripcion
    };
    this.cdr.markForCheck();
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
    this.cdr.markForCheck();
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    this.loading = true;
    this.cdr.markForCheck();
    this.asistenciaService.actualizarActividad(this.editandoId, this.editandoActividad)
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
          this.error = 'Error al actualizar actividad.';
          this.cdr.markForCheck();
        }
      });
  }

  eliminarActividad(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
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
        },
        error: (err) => {
          console.error('❌ Error al eliminar actividad:', err);
          this.error = 'Error al eliminar actividad.';
          this.cdr.markForCheck();
        }
      });
  }
}