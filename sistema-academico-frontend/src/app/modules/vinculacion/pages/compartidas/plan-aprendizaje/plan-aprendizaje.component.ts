import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PlanAprendizajeService } from '../../../services/plan-aprendizaje.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { PlanAprendizaje } from '../../../models/plan-aprendizaje.model';
import { finalize } from 'rxjs/operators';
import { ExcelExportService } from '../../../services/excel-export.service'; // ✅ NUEVO

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
  private excelService = inject(ExcelExportService); // ✅ NUEVO

  data: PlanAprendizaje | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  // Edición de resultado de aprendizaje
  editandoIndice: number | null = null;
  resultadoEdit: string = '';

  // Reflexión - auto-guardado
  reflexionEdit: string = '';
  reflexionOriginal: string = '';
  guardandoReflexion: boolean = false;
  reflexionGuardada: boolean = true;
  timeoutReflexion: any = null;
  mensajeFeedback: string = '';
  editandoReflexion = false;

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
          
          // Cargar reflexión desde los datos (viene del backend)
          this.reflexionEdit = data.reflexion_estudiante || '';
          this.reflexionOriginal = this.reflexionEdit;
          this.reflexionGuardada = true;
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Plan de Aprendizaje:', err);
          this.error = 'No se pudo cargar el plan de aprendizaje.';
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // REFLEXIÓN - AUTO-GUARDADO
  // ============================================
  onReflexionChange(): void {
    if (this.timeoutReflexion) {
      clearTimeout(this.timeoutReflexion);
    }

    this.reflexionGuardada = false;

    this.timeoutReflexion = setTimeout(() => {
      this.guardarReflexion();
    }, 1500);
  }

  guardarReflexion(): void {
    if (this.guardandoReflexion) return;
    if (this.reflexionEdit === this.reflexionOriginal) {
      this.reflexionGuardada = true;
      this.editandoReflexion = false;
      this.cdr.markForCheck();
      return;
    }

    this.guardandoReflexion = true;
    this.reflexionGuardada = false;
    this.cdr.markForCheck();

    this.service.actualizarReflexion(this.idVinculacion, this.reflexionEdit)
      .pipe(finalize(() => {
        this.guardandoReflexion = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          console.log('✅ Reflexión guardada automáticamente');
          this.reflexionOriginal = this.reflexionEdit;
          this.reflexionGuardada = true;
          this.mostrarFeedback('Reflexión guardada ✅');
          this.editandoReflexion = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al guardar reflexión:', err);
          this.error = 'Error al guardar la reflexión.';
          this.reflexionGuardada = false;
          this.cdr.markForCheck();
        }
      });
  }

  toggleEditReflexion(): void {
    if (this.editandoReflexion) {
      this.guardarReflexion();
    } else {
      this.editandoReflexion = true;
      this.reflexionEdit = this.data?.reflexion_estudiante || '';
      this.reflexionOriginal = this.reflexionEdit;
      this.cdr.markForCheck();
    }
  }

  mostrarFeedback(mensaje: string): void {
    this.mensajeFeedback = mensaje;
    setTimeout(() => {
      this.mensajeFeedback = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  // ============================================
  // RESULTADO DE APRENDIZAJE
  // ============================================
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

  // ✅ NUEVO: Exportar a Excel
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.data) {
      alert('No hay datos para exportar.');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'P.A.',
        this.data
      );
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel.');
    }
  }
}