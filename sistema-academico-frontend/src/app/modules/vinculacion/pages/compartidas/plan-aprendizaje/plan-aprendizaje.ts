// modules/vinculacion/pages/compartidas/plan-aprendizaje/plan-aprendizaje.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PlanAprendizajeService } from '../../../services/plan-aprendizaje.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { PlanAprendizaje, ActividadPlan } from '../../../models/plan-aprendizaje.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-plan-aprendizaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-aprendizaje.html',
  styleUrls: ['./plan-aprendizaje.scss']
})
export class PlanAprendizajeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(PlanAprendizajeService);
  private authService = inject(AuthService);

  data: PlanAprendizaje | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number | null = null;

  // Para editar resultado de aprendizaje
  editandoIndice: number | null = null;
  resultadoEdit: string = '';

  // Reflexión (solo lectura, no hay endpoint)
  reflexion: string = 'Los estudiantes desarrollaron algunas habilidades blandas como: comunicación en equipo, coordinación de actividades, planificación de actividades.';

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
    this.service.obtenerPlan(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.data = data;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el plan de aprendizaje.';
          console.error(err);
        }
      });
  }

  editarResultado(index: number): void {
    if (!this.data) return;
    this.editandoIndice = index;
    this.resultadoEdit = this.data.informe_actividades[index].resultado_aprendizaje || '';
  }

  cancelarEdicion(): void {
    this.editandoIndice = null;
    this.resultadoEdit = '';
  }

  guardarResultado(index: number): void {
  if (!this.data) return;
  const actividad = this.data.informe_actividades[index];
  // Asumimos que el modelo ahora tiene un campo 'id' (debe venir del backend)
  const idActividad = actividad.id; // Asegúrate de que el modelo incluya 'id'
  if (!idActividad) {
    alert('La actividad no tiene ID, no se puede actualizar.');
    return;
  }
  this.loading = true;
  this.service.actualizarResultadoAprendizaje(idActividad, this.resultadoEdit)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: () => {
        // Actualizar localmente
        actividad.resultado_aprendizaje = this.resultadoEdit;
        this.cancelarEdicion();
      },
      error: (err: any) => {
        this.error = 'Error al actualizar resultado.';
        console.error(err);
      }
    });
}

}