import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InformeFinalService } from '../../../services/informe-final.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { InformeFinal } from '../../../models/informe-final.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informe-final.component.html',
  styleUrls: ['./informe-final.component.scss']
})
export class InformeFinalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InformeFinalService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);  // ✅ INYECTADO

  data: InformeFinal | null = null;
  loading = true;
  error: string | null = null;
  idVinculacion: number = 0;

  // Roles
  isEstudiante = false;
  isDocente = false;
  isCoordinador = false;

  // Variables para edición (ESTUDIANTE)
  editandoActividades = false;
  actividadesEdit: any[] = [];

  editandoObjetivos = false;
  objetivosEdit: any[] = [];

  editandoReflexion = false;
  reflexionEdit: string = '';

  // Evaluación (SOLO DOCENTE)
  evaluacionEdit = {
    nota_final: '',
    nota_letras: '',
    observaciones: ''
  };
  editandoEvaluacion = false;

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');
    this.isCoordinador = roles.includes('COORDINADOR');

    // Si es COORDINADOR, no puede ver esta pantalla
    if (this.isCoordinador) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla.';
      this.loading = false;
      this.cdr.markForCheck();  // ✅ AÑADIDO
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else if (this.isEstudiante) {
        // ✅ Si es estudiante y no viene ID, obtener vinculación activa
        this.obtenerVinculacionActiva();
      } else if (this.isDocente && idParam === 0) {
        // Si es docente y no viene ID, mostrar error
        this.error = 'Debe seleccionar un estudiante primero.';
        this.loading = false;
        this.cdr.markForCheck();  // ✅ AÑADIDO
      }
    });
  }

  /**
   * ✅ Obtener vinculación activa del estudiante autenticado
   */
  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.cdr.markForCheck();  // ✅ AÑADIDO
    this.vinculacionService.obtenerVinculacionActiva()
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();   // este método ya maneja su propio loading/finalize
          } else {
            this.error = 'No se encontró una vinculación activa para este estudiante.';
            this.loading = false;
            this.cdr.markForCheck();  // ✅ AÑADIDO
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
          this.loading = false;
          this.cdr.markForCheck();  // ✅ AÑADIDO
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();  // ✅ AÑADIDO
    console.log('🔵 Cargando Informe Final para vinculación:', this.idVinculacion);
    
    this.service.obtenerInforme(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();  // ✅ AÑADIDO (dentro de finalize)
      }))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de Informe Final recibidos:', data);
          this.data = data;
          // Inicializar copias para edición
          this.actividadesEdit = data.resumen_actividades.map(a => ({ ...a }));
          this.objetivosEdit = data.objetivos_proyecto.map(o => ({ ...o }));
          this.reflexionEdit = data.reflexion_estudiante || '';
          this.evaluacionEdit = {
            nota_final: data.evaluacion_final.nota_final || '',
            nota_letras: data.evaluacion_final.nota_letras || '',
            observaciones: data.evaluacion_final.observaciones || ''
          };
          this.cdr.markForCheck();  // ✅ AÑADIDO
        },
        error: (err) => {
          console.error('❌ Error al cargar Informe Final:', err);
          this.error = 'No se pudo cargar el informe final.';
          this.cdr.markForCheck();  // ✅ AÑADIDO
        }
      });
  }

  // ========== ACTIVIDADES (SOLO ESTUDIANTE) ==========
  toggleEditActividades(): void {
    if (!this.isEstudiante) return;
    this.editandoActividades = !this.editandoActividades;
    if (this.editandoActividades && this.data) {
      this.actividadesEdit = this.data.resumen_actividades.map(a => ({ ...a }));
    }
    this.cdr.markForCheck();  // ✅ AÑADIDO
  }

  guardarActividades(): void {
    if (!this.isEstudiante) return;
    alert('Funcionalidad en desarrollo: guardar actividades. (Endpoint pendiente)');
    this.editandoActividades = false;
    this.cdr.markForCheck();  // ✅ AÑADIDO
  }

  // ========== OBJETIVOS (SOLO ESTUDIANTE) ==========
  toggleEditObjetivos(): void {
    if (!this.isEstudiante) return;
    this.editandoObjetivos = !this.editandoObjetivos;
    if (this.editandoObjetivos && this.data) {
      this.objetivosEdit = this.data.objetivos_proyecto.map(o => ({ ...o }));
    }
    this.cdr.markForCheck();  // ✅ AÑADIDO
  }

  guardarObjetivos(): void {
    if (!this.isEstudiante) return;
    alert('Funcionalidad en desarrollo: guardar objetivos. (Endpoint pendiente)');
    this.editandoObjetivos = false;
    this.cdr.markForCheck();  // ✅ AÑADIDO
  }

  // ========== REFLEXIÓN (SOLO ESTUDIANTE) ==========
  toggleEditReflexion(): void {
    if (!this.isEstudiante) return;
    this.editandoReflexion = !this.editandoReflexion;
    if (!this.editandoReflexion && this.data) {
      this.data.reflexion_estudiante = this.reflexionEdit;
      alert('Reflexión actualizada localmente. (Endpoint pendiente para guardar en BD)');
    }
    this.cdr.markForCheck();  // ✅ AÑADIDO
  }

  // ========== EVALUACIÓN (SOLO DOCENTE) ==========
  toggleEditEvaluacion(): void {
    if (!this.isDocente) return;
    this.editandoEvaluacion = !this.editandoEvaluacion;
    if (!this.editandoEvaluacion && this.data) {
      this.data.evaluacion_final.nota_final = this.evaluacionEdit.nota_final;
      this.data.evaluacion_final.nota_letras = this.evaluacionEdit.nota_letras;
      this.data.evaluacion_final.observaciones = this.evaluacionEdit.observaciones;
      alert('Evaluación guardada localmente. (Endpoint pendiente para guardar en BD)');
    }
    this.cdr.markForCheck();  // ✅ AÑADIDO
  }
}