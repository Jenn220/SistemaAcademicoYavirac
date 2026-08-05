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

  // Edición de resultados de aprendizaje
  editandoIndice: number | null = null;
  resultadoEdit: string = '';

  // Edición de reflexión
  reflexionEdit: string = '';
  editandoReflexion = false;

  // Edición de avances del proyecto
  avances: { tema: string; seccion: string; avance: number }[] = [];
  editandoAvanceIndex: number | null = null;
  avanceEdit: number = 0;

  // Flag para controlar si es la primera carga
  private primeraCarga = true;

  ngOnInit(): void {
    // SOLO ESTUDIANTE puede ver esta pantalla
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
      this.loading = false;
      return;
    }

    this.route.params.subscribe(params => {
      this.idVinculacion = params['id'] ? +params['id'] : 0;
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
          // Inicializar reflexión solo en la primera carga
          if (this.primeraCarga) {
            this.reflexionEdit = 'Los estudiantes desarrollaron algunas habilidades blandas como: comunicación en equipo, coordinación de actividades, planificación de actividades.';
            this.primeraCarga = false;
          }
          // Inicializar avances
          this.avances = [
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '1. Título del Proyecto (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '2. Antecedentes (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '3. Marco Teórico (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '4. Metodología (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '5. Resultados (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '6. Conclusiones y recomendaciones (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '7. Referencias bibliográficas (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '8. Anexos (10%)', avance: 0.1 },
            { tema: data.cabecera?.titulo_proyecto || '', seccion: '9. Entrega de proyecto final (20%)', avance: 0.2 }
          ];
        },
        error: (err) => {
          this.error = 'No se pudo cargar el plan de aprendizaje.';
          console.error(err);
        }
      });
  }

  // ========== RESULTADOS DE APRENDIZAJE ==========
  editarResultado(index: number): void {
    if (!this.data) return;
    this.editandoIndice = index;
    this.resultadoEdit = this.data.informe_actividades[index].resultado_aprendizaje || '';
  }

  cancelarEdicionResultado(): void {
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
          this.cancelarEdicionResultado();
        },
        error: (err) => {
          this.error = 'Error al actualizar resultado.';
          console.error(err);
        }
      });
  }

  // ========== REFLEXIÓN ==========
  toggleEditReflexion(): void {
    this.editandoReflexion = !this.editandoReflexion;
    if (!this.editandoReflexion) {
      // Guardar reflexión (localmente, sin endpoint)
      // Aquí se puede agregar un endpoint si existe en el backend
      alert('Reflexión actualizada localmente. (Endpoint pendiente para guardar en BD)');
    }
  }

  // ========== AVANCES ==========
  editarAvance(index: number): void {
    this.editandoAvanceIndex = index;
    this.avanceEdit = this.avances[index].avance;
  }

  cancelarEdicionAvance(): void {
    this.editandoAvanceIndex = null;
    this.avanceEdit = 0;
  }

  guardarAvance(index: number): void {
    this.avances[index].avance = this.avanceEdit;
    this.cancelarEdicionAvance();
    // Aquí se puede agregar un endpoint si existe en el backend
  }

  getTotalAvance(): number {
    return this.avances.reduce((acc, a) => acc + a.avance, 0);
  }
}