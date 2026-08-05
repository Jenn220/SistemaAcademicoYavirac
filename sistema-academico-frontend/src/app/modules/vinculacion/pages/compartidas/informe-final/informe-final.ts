import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InformeFinalService } from '../../../services/informe-final.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { InformeFinal } from '../../../models/informe-final.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informe-final.html',
  styleUrls: ['./informe-final.scss']
})
export class InformeFinalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InformeFinalService);
  private authService = inject(AuthService);

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
    this.service.obtenerInforme(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
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
        },
        error: (err) => {
          this.error = 'No se pudo cargar el informe final.';
          console.error(err);
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
  }

  guardarActividades(): void {
    if (!this.isEstudiante) return;
    // Aquí se puede agregar un endpoint si existe
    alert('Funcionalidad en desarrollo: guardar actividades. (Endpoint pendiente)');
    this.editandoActividades = false;
  }

  // ========== OBJETIVOS (SOLO ESTUDIANTE) ==========
  toggleEditObjetivos(): void {
    if (!this.isEstudiante) return;
    this.editandoObjetivos = !this.editandoObjetivos;
    if (this.editandoObjetivos && this.data) {
      this.objetivosEdit = this.data.objetivos_proyecto.map(o => ({ ...o }));
    }
  }

  guardarObjetivos(): void {
    if (!this.isEstudiante) return;
    alert('Funcionalidad en desarrollo: guardar objetivos. (Endpoint pendiente)');
    this.editandoObjetivos = false;
  }

  // ========== REFLEXIÓN (SOLO ESTUDIANTE) ==========
  toggleEditReflexion(): void {
    if (!this.isEstudiante) return;
    this.editandoReflexion = !this.editandoReflexion;
    if (!this.editandoReflexion && this.data) {
      this.data.reflexion_estudiante = this.reflexionEdit;
      alert('Reflexión actualizada localmente. (Endpoint pendiente para guardar en BD)');
    }
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
  }
}