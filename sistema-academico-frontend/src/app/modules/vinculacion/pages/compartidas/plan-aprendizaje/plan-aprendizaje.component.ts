import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { PlanAprendizajeService } from '../../../services/plan-aprendizaje.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { ExcelExportService } from '../../../services/excel-export.service';

// ✅ IMPORTAR MODAL DESDE SHARED
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

import { PlanAprendizaje } from '../../../models/plan-aprendizaje.model';

@Component({
  selector: 'app-plan-aprendizaje',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent  // ✅ AGREGADO
  ],
  templateUrl: './plan-aprendizaje.component.html',
  styleUrls: ['./plan-aprendizaje.component.scss']
})
export class PlanAprendizajeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(PlanAprendizajeService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);
  private excelService = inject(ExcelExportService);

  // ============================================
  // ESTADO DEL COMPONENTE
  // ============================================
  data: PlanAprendizaje | null = null;
  semanasAgrupadas: any[] = [];
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  // ============================================
  // MODAL
  // ============================================
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalButtonText: string = 'Aceptar';

  // ============================================
  // EDICIÓN DE RESULTADO DE APRENDIZAJE
  // ============================================
  editandoIndice: number | null = null;
  resultadoEdit: string = '';

  // ============================================
  // REFLEXIÓN - AUTO-GUARDADO
  // ============================================
  reflexionEdit: string = '';
  reflexionOriginal: string = '';
  guardandoReflexion: boolean = false;
  reflexionGuardada: boolean = true;
  timeoutReflexion: any = null;
  mensajeFeedback: string = '';
  editandoReflexion = false;

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.mostrarModal(
        'Permisos insuficientes',
        'No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.',
        'warning'
      );
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

  // ============================================
  // MODAL
  // ============================================
  private mostrarModal(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttonText: string = 'Aceptar'
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalButtonText = buttonText;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.cdr.markForCheck();
  }

  // ============================================
  // OBTENER VINCULACIÓN ACTIVA
  // ============================================
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
            this.mostrarModal('Sin vinculación', 'No se encontró una vinculación activa para este estudiante.', 'warning');
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.mostrarModal('Error', err.error?.message || 'Error al obtener la vinculación activa.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // CARGAR DATOS
  // ============================================
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

          this.semanasAgrupadas = this.agruparPorSemanaActividad(data.informe_actividades || []);

          this.reflexionEdit = data.reflexion_estudiante || '';
          this.reflexionOriginal = this.reflexionEdit;
          this.reflexionGuardada = true;

          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Plan de Aprendizaje:', err);
          this.mostrarModal('Error', err.error?.message || 'No se pudo cargar el plan de aprendizaje.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // AGRUPAR ACTIVIDADES POR SEMANA/BLOQUE
  // ============================================
  agruparPorSemanaActividad(actividades: any[]): any[] {
    const agrupadas: any[] = [];
    const map = new Map();

    actividades.forEach((item) => {
      if (!item.actividad || item.actividad.trim() === '') return;

      const clave = item.actividad.trim();

      if (!map.has(clave)) {
        const nuevoGrupo = {
          semana: `Semana ${agrupadas.length + 1}`,
          fecha: item.fecha,
          actividad: item.actividad,
          resultado_aprendizaje: item.resultado_aprendizaje,
          id: item.id
        };
        map.set(clave, nuevoGrupo);
        agrupadas.push(nuevoGrupo);
      }
    });

    return agrupadas;
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
          this.mostrarModal('Error', err.error?.message || 'Error al guardar la reflexión.', 'error');
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
    if (!this.semanasAgrupadas) return;
    this.editandoIndice = index;
    this.resultadoEdit = this.semanasAgrupadas[index].resultado_aprendizaje || '';
    this.cdr.markForCheck();
  }

  cancelarEdicionResultado(): void {
    this.editandoIndice = null;
    this.resultadoEdit = '';
    this.cdr.markForCheck();
  }

  guardarResultado(index: number): void {
    if (!this.semanasAgrupadas) return;
    const item = this.semanasAgrupadas[index];
    if (!item.id) {
      this.mostrarModal('Error', 'La actividad no tiene ID, no se puede actualizar.', 'error');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.service.actualizarResultadoAprendizaje(item.id, this.resultadoEdit)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          item.resultado_aprendizaje = this.resultadoEdit;
          this.cancelarEdicionResultado();
          this.mostrarModal('Éxito', 'Resultado de aprendizaje actualizado correctamente.', 'success');
        },
        error: (err) => {
          console.error('❌ Error al actualizar resultado:', err);
          this.mostrarModal('Error', err.error?.message || 'Error al actualizar resultado.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // EXPORTAR A EXCEL
  // ============================================
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.data) {
      this.mostrarModal('Sin datos', 'No hay datos para exportar.', 'warning');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'P.A.',
        this.data
      );
      this.mostrarModal('Éxito', 'Archivo Excel exportado correctamente.', 'success');
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      this.mostrarModal('Error', 'Error al exportar el archivo Excel.', 'error');
    }
  }
}