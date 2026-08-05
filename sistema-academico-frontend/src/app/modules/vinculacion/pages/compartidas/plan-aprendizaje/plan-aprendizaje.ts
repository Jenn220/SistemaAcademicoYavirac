import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PlanAprendizajeService } from '../../../services/plan-aprendizaje.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { PlanAprendizaje } from '../../../models/plan-aprendizaje.model';
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
  idVinculacion: number = 0;

  editandoIndice: number | null = null;
  resultadoEdit: string = '';

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
    this.service.obtenerPlan(this.idVinculacion)
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
    if (!actividad.id) {
      alert('La actividad no tiene ID, no se puede actualizar.');
      return;
    }
    this.loading = true;
    this.service.actualizarResultadoAprendizaje(actividad.id, this.resultadoEdit)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          actividad.resultado_aprendizaje = this.resultadoEdit;
          this.cancelarEdicion();
        },
        error: (err) => {
          this.error = 'Error al actualizar resultado.';
          console.error(err);
        }
      });
  }
}