import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ControlAsistenciaService } from '../../../services/control-asistencia.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { AsistenciaEstudianteResponse, ActividadEstudiante, CreateActividadEstudianteDto, UpdateActividadEstudianteDto } from '../../../models/control-asistencia.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-asistencia.html',
  styleUrls: ['./control-asistencia.scss']
})
export class ControlAsistenciaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private asistenciaService = inject(ControlAsistenciaService);
  private authService = inject(AuthService);

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
    this.isEstudiante = this.authService.roles().includes('ESTUDIANTE');

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idVinculacion = +params['id'];
      } else {
        this.idVinculacion = 0;
      }
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.asistenciaService.obtenerAsistencia(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.data = data;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el control de asistencia.';
          console.error(err);
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
  }

  cancelarNuevo(): void {
    this.mostrandoFormulario = false;
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
    this.asistenciaService.crearActividad(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrandoFormulario = false;
        },
        error: (err) => {
          this.error = 'Error al agregar actividad.';
          console.error(err);
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
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    this.loading = true;
    this.asistenciaService.actualizarActividad(this.editandoId, this.editandoActividad)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.cancelarEdicion();
        },
        error: (err) => {
          this.error = 'Error al actualizar actividad.';
          console.error(err);
        }
      });
  }

  eliminarActividad(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.loading = true;
    this.asistenciaService.eliminarActividad(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          this.error = 'Error al eliminar actividad.';
          console.error(err);
        }
      });
  }
}