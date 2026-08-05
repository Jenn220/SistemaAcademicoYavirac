// modules/vinculacion/pages/compartidas/control-asistencia/control-asistencia.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ControlAsistenciaService } from '../../../services/control-asistencia.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { AsistenciaEstudianteResponse, ActividadEstudiante } from '../../../models/control-asistencia.model';
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
  idVinculacion: number | null = null;

  // Para nueva actividad
  nuevaActividad: Partial<ActividadEstudiante> = {
    fecha: '',
    hora_entrada: '',
    hora_salida: '',
    descripcion: ''
  };
  mostrandoFormulario = false;

  // Para edición
  editandoId: number | null = null;
  editandoActividad: Partial<ActividadEstudiante> = {};

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
    const id = this.idVinculacion ?? 0;
    this.asistenciaService.obtenerAsistencia(id)
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

  // ================== CRUD ==================

  mostrarFormulario(): void {
    this.mostrandoFormulario = true;
    this.nuevaActividad = { fecha: '', hora_entrada: '', hora_salida: '', descripcion: '' };
  }

  cancelarNuevo(): void {
    this.mostrandoFormulario = false;
  }

  agregarActividad(): void {
    if (!this.nuevaActividad.fecha || !this.nuevaActividad.hora_entrada || !this.nuevaActividad.hora_salida) {
      alert('Complete fecha, hora entrada y salida.');
      return;
    }
    const payload = {
      id_vinculacion: this.idVinculacion || 0,
      fecha: this.nuevaActividad.fecha,
      hora_inicio: this.nuevaActividad.hora_entrada,
      hora_fin: this.nuevaActividad.hora_salida,
      actividades_realizadas: this.nuevaActividad.descripcion || ''
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
    this.editandoActividad = { ...actividad };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    const payload: any = {
      fecha: this.editandoActividad.fecha,
      hora_inicio: this.editandoActividad.hora_entrada,
      hora_fin: this.editandoActividad.hora_salida,
      actividades_realizadas: this.editandoActividad.descripcion
    };
    this.loading = true;
    this.asistenciaService.actualizarActividad(this.editandoId, payload)
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