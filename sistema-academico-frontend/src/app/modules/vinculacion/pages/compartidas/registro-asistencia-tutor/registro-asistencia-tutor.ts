import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RegistroAsistenciaTutorService } from '../../../services/registro-asistencia-tutor.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { AsistenciaTutorResponse, AsistenciaTutor, CreateAsistenciaTutorDto, UpdateAsistenciaTutorDto } from '../../../models/registro-asistencia-tutor.model';
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
  puedeEditar = false;
  idVinculacion: number = 0;

  editandoId: number | null = null;
  editandoActividad: UpdateAsistenciaTutorDto = {};

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
    this.service.obtenerReporte(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.data = data;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el registro de asistencia del tutor.';
          console.error(err);
        }
      });
  }

  mostrarFormulario(): void {
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
          this.error = 'Error al agregar actividad.';
          console.error(err);
        }
      });
  }

  editarActividad(act: AsistenciaTutor): void {
    this.editandoId = act.id;
    this.editandoActividad = {
      actividad_realizada: act.actividad_realizada
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoActividad = {};
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    this.loading = true;
    this.service.actualizarAsistencia(this.editandoId, this.editandoActividad)
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
}