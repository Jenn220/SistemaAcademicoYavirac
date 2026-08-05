// modules/vinculacion/pages/compartidas/registro-asistencia-tutor/registro-asistencia-tutor.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RegistroAsistenciaTutorService } from '../../../services/registro-asistencia-tutor.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { AsistenciaTutorResponse, AsistenciaTutor } from '../../../models/registro-asistencia-tutor.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-registro-asistencia-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-asistencia-tutor.html',
  styleUrls: ['./registro-asistencia-tutor.scss']
})
export class RegistroAsistenciaTutorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(RegistroAsistenciaTutorService);
  private authService = inject(AuthService);

  data: AsistenciaTutorResponse | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  isDocente = false;
  idVinculacion: number | null = null;

  // Variables para edición
  editandoId: number | null = null;
  editandoActividad: Partial<AsistenciaTutor> = {};
  observacionEdit: string = '';
  puedeEditar = false;

  // Nueva actividad
  nuevaActividad: Partial<AsistenciaTutor> = {
    fecha: '',
    hora_entrada: '',
    hora_salida: '',
    actividad_realizada: ''
  };
  mostrandoFormulario = false;

  ngOnInit(): void {
    const roles = this.authService.roles();
  // Aquí defines quién puede editar (DOCENTE, COORDINADOR, TUTOR_EMPRESARIAL)
  this.puedeEditar = this.authService.tieneAlgunRol(['DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL']);

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
    this.service.obtenerReporte(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.observacionEdit = data.totales.observaciones || '';
        },
        error: (err) => {
          this.error = 'No se pudo cargar el registro de asistencia del tutor.';
          console.error(err);
        }
      });
  }

  // ================== CRUD para actividades (estudiante) ==================

  mostrarFormulario(): void {
    this.mostrandoFormulario = true;
    this.nuevaActividad = { fecha: '', hora_entrada: '', hora_salida: '', actividad_realizada: '' };
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
      actividad_realizada: this.nuevaActividad.actividad_realizada || ''
    };
    this.loading = true;
    this.service.crearAsistencia(payload)
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

  editarActividad(act: AsistenciaTutor): void {
    this.editandoId = act.id;
    this.editandoActividad = { ...act };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    // El estudiante solo puede editar actividad_realizada
    const payload: any = {
      actividad_realizada: this.editandoActividad.actividad_realizada
    };
    // Si es docente, podría editar otros campos, pero según el flujo solo observaciones
    this.loading = true;
    this.service.actualizarAsistencia(this.editandoId, payload)
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
    this.service.eliminarAsistencia(id)
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

  // ================== Guardar observaciones (docente) ==================

  guardarObservaciones(): void {
    if (!this.idVinculacion) return;
    // Aquí necesitamos un endpoint para guardar observación. 
    // No existe en el backend, así que lo simularemos o mostraremos un mensaje.
    // Según lo que vimos, no hay un PATCH para observaciones en asistencia-tutor.
    // Por ahora, mostramos un mensaje.
    alert('Funcionalidad en desarrollo: guardar observaciones. (Backend pendiente)');
    // Si existiera, haríamos un PATCH a /vinculacion/asistencia-tutor/:id con { observaciones: this.observacionEdit }
  }
}