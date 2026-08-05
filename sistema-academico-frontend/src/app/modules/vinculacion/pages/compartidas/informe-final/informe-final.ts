// modules/vinculacion/pages/compartidas/informe-final/informe-final.component.ts
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
  isEstudiante = false;
  isDocente = false;
  idVinculacion: number | null = null;

  // Edición de campos (estudiante)
  editandoGenerales = false;
  editandoActividades = false;
  editandoObjetivos = false;

  // Copias para edición
  datosGeneralesEdit: any = {};
  actividadesEdit: any[] = [];
  objetivosEdit: any[] = [];

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');

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
    this.service.obtenerInforme(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.data = data;
          // Inicializar copias para edición
          this.datosGeneralesEdit = { ...data.datos_generales };
          this.actividadesEdit = data.resumen_actividades.map(a => ({ ...a }));
          this.objetivosEdit = data.objetivos_proyecto.map(o => ({ ...o }));
        },
        error: (err) => {
          this.error = 'No se pudo cargar el informe final.';
          console.error(err);
        }
      });
  }

  // ================== Acciones de edición (estudiante) ==================

  toggleEditGenerales(): void {
    this.editandoGenerales = !this.editandoGenerales;
    if (this.editandoGenerales && this.data) {
      this.datosGeneralesEdit = { ...this.data.datos_generales };
    }
  }

  guardarGenerales(): void {
    // No hay endpoint para guardar, solo mostramos mensaje
    alert('Funcionalidad en desarrollo: guardar datos generales. (Backend pendiente)');
    this.editandoGenerales = false;
  }

  toggleEditActividades(): void {
    this.editandoActividades = !this.editandoActividades;
    if (this.editandoActividades && this.data) {
      this.actividadesEdit = this.data.resumen_actividades.map(a => ({ ...a }));
    }
  }

  guardarActividades(): void {
    alert('Funcionalidad en desarrollo: guardar actividades. (Backend pendiente)');
    this.editandoActividades = false;
  }

  toggleEditObjetivos(): void {
    this.editandoObjetivos = !this.editandoObjetivos;
    if (this.editandoObjetivos && this.data) {
      this.objetivosEdit = this.data.objetivos_proyecto.map(o => ({ ...o }));
    }
  }

  guardarObjetivos(): void {
    alert('Funcionalidad en desarrollo: guardar objetivos. (Backend pendiente)');
    this.editandoObjetivos = false;
  }

  // ================== Evaluación del tutor (docente) ==================

  guardarEvaluacion(): void {
    alert('Funcionalidad en desarrollo: guardar evaluación del tutor. (Backend pendiente)');
  }
}