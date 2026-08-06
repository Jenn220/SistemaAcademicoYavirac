import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PlanAprendizajeService } from '../../../services/plan-aprendizaje.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { PlanAprendizaje } from '../../../models/plan-aprendizaje.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-plan-aprendizaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-aprendizaje.component.html',
  styleUrls: ['./plan-aprendizaje.component.scss']
})
export class PlanAprendizajeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(PlanAprendizajeService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);

  data: PlanAprendizaje | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  editandoIndice: number | null = null;
  resultadoEdit: string = '';

  reflexionEdit: string = '';
  editandoReflexion = false;

  avances: { tema: string; seccion: string; avance: number }[] = [];
  editandoAvanceIndex: number | null = null;
  avanceEdit: number = 0;

  private primeraCarga = true;

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
    console.log('🔵 Cargando Plan de Aprendizaje para vinculación:', this.idVinculacion);
    
    this.service.obtenerPlan(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de Plan de Aprendizaje recibidos:', data);
          this.data = data;
          if (this.primeraCarga) {
            this.reflexionEdit = 'Los estudiantes desarrollaron algunas habilidades blandas como: comunicación en equipo, coordinación de actividades, planificación de actividades.';
            this.primeraCarga = false;
          }
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
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Plan de Aprendizaje:', err);
          this.error = 'No se pudo cargar el plan de aprendizaje.';
          this.cdr.markForCheck();
        }
      });
  }

  editarResultado(index: number): void {
    if (!this.data) return;
    this.editandoIndice = index;
    this.resultadoEdit = this.data.informe_actividades[index].resultado_aprendizaje || '';
    this.cdr.markForCheck();
  }

  cancelarEdicionResultado(): void {
    this.editandoIndice = null;
    this.resultadoEdit = '';
    this.cdr.markForCheck();
  }

  guardarResultado(index: number): void {
    if (!this.data) return;
    const actividad = this.data.informe_actividades[index];
    if (!actividad.id) {
      alert('La actividad no tiene ID, no se puede actualizar.');
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    this.service.actualizarResultadoAprendizaje(actividad.id, this.resultadoEdit)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          actividad.resultado_aprendizaje = this.resultadoEdit;
          this.cancelarEdicionResultado();
        },
        error: (err) => {
          console.error('❌ Error al actualizar resultado:', err);
          this.error = 'Error al actualizar resultado.';
          this.cdr.markForCheck();
        }
      });
  }

  toggleEditReflexion(): void {
    this.editandoReflexion = !this.editandoReflexion;
    if (!this.editandoReflexion) {
      alert('Reflexión actualizada localmente. (Endpoint pendiente para guardar en BD)');
    }
    this.cdr.markForCheck();
  }

  editarAvance(index: number): void {
    this.editandoAvanceIndex = index;
    this.avanceEdit = this.avances[index].avance;
    this.cdr.markForCheck();
  }

  cancelarEdicionAvance(): void {
    this.editandoAvanceIndex = null;
    this.avanceEdit = 0;
    this.cdr.markForCheck();
  }

  guardarAvance(index: number): void {
    this.avances[index].avance = this.avanceEdit;
    this.cancelarEdicionAvance();
  }

  getTotalAvance(): number {
    return this.avances.reduce((acc, a) => acc + a.avance, 0);
  }
}