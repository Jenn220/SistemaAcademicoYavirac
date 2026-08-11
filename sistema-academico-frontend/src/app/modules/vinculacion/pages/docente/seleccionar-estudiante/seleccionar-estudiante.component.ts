import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { EstudianteDocente } from '../../../models/vinculacion.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-seleccionar-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccionar-estudiante.component.html',
  styleUrls: ['./seleccionar-estudiante.component.scss']
})
export class SeleccionarEstudianteComponent implements OnInit {
  private service = inject(VinculacionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  estudiantes: EstudianteDocente[] = [];
  filtered: EstudianteDocente[] = [];
  loading = true;
  error: string | null = null;
  terminoBusqueda: string = '';

  estudianteSeleccionado: EstudianteDocente | null = null;
  mostrandoDocumentos = false;

  documentos = [
    { 
      id: 'inicio-actividades', 
      nombre: '📋 Inicio de Actividades', 
      descripcion: 'Ver y editar proyecto y fechas', 
      ruta: 'inicio-actividades' 
    },
    { 
      id: 'control-asistencia', 
      nombre: '📋 Control de Asistencia', 
      descripcion: 'Ver y editar observaciones', 
      ruta: 'control-asistencia' 
    },
    { 
      id: 'registro-asistencia-tutor', 
      nombre: '📝 Registro Asistencia Tutor', 
      descripcion: 'Ver y editar todo el recuadro', 
      ruta: 'registro-asistencia-tutor' 
    },
    { 
      id: 'informe-final', 
      nombre: '📄 Informe Final', 
      descripcion: 'Ver y editar evaluación final', 
      ruta: 'informe-final' 
    }
  ];

  ngOnInit(): void {
    if (!this.authService.tieneAlgunRol(['DOCENTE'])) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo docentes pueden acceder.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    this.service.obtenerEstudiantesAsignados()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.estudiantes = data;
          this.filtered = data;
          this.cdr.markForCheck();
          
          // ✅ VERIFICAR SI VIENE DE "VOLVER A ARCHIVOS"
          this.verificarEstudianteDesdeQueryParams();
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los estudiantes.';
          console.error(err);
          this.cdr.markForCheck();
        }
      });
  }

  // ✅ NUEVO MÉTODO: Verificar si hay un estudiante en los queryParams
  verificarEstudianteDesdeQueryParams(): void {
    const estudianteId = this.route.snapshot.queryParamMap.get('estudianteId');
    
    if (estudianteId) {
      // Buscar el estudiante en la lista
      const estudiante = this.estudiantes.find(
        est => String(est.id_vinculacion) === estudianteId
      );
      
      if (estudiante) {
        // ✅ Seleccionar automáticamente al estudiante
        this.seleccionarEstudiante(estudiante);
      } else {
        // Si no se encuentra, limpiar el queryParam
        this.router.navigate([], {
          queryParams: { estudianteId: null },
          queryParamsHandling: 'merge'
        });
      }
    }
  }

  buscar(): void {
    const term = this.terminoBusqueda.toLowerCase().trim();
    if (!term) {
      this.filtered = this.estudiantes;
    } else {
      this.filtered = this.estudiantes.filter(est =>
        est.estudiante?.toLowerCase().includes(term) ||
        est.cedula?.includes(term) ||
        est.entidad_beneficiaria?.toLowerCase().includes(term) ||
        est.carrera?.toLowerCase().includes(term)
      );
    }
    this.cdr.markForCheck();
  }

  // ✅ SELECCIONAR ESTUDIANTE - Guardar ID en localStorage
  seleccionarEstudiante(estudiante: EstudianteDocente): void {
    // ✅ Guardar el ID del estudiante en localStorage para volver después
    localStorage.setItem('estudiante_seleccionado_id', String(estudiante.id_vinculacion));
    localStorage.setItem('estudiante_seleccionado_nombre', estudiante.estudiante);
    
    this.estudianteSeleccionado = estudiante;
    this.mostrandoDocumentos = true;
    this.cdr.markForCheck();
  }

  // ✅ VOLVER A LA LISTA DE ESTUDIANTES - Limpiar localStorage
  volverALista(): void {
    // ✅ Limpiar el ID del estudiante
    localStorage.removeItem('estudiante_seleccionado_id');
    localStorage.removeItem('estudiante_seleccionado_nombre');
    
    // ✅ Limpiar queryParams
    this.router.navigate([], {
      queryParams: { estudianteId: null },
      queryParamsHandling: 'merge'
    });
    
    this.estudianteSeleccionado = null;
    this.mostrandoDocumentos = false;
    this.cdr.markForCheck();
  }

  irADocumento(ruta: string): void {
    if (!this.estudianteSeleccionado) return;
    const id = this.estudianteSeleccionado.id_vinculacion;
    this.router.navigate(['/vinculacion/docente/estudiante', id, ruta]);
  }

  getEstadoInforme(estado: string): string {
    const estados: Record<string, string> = {
      'CALIFICADO': '✅ Calificado',
      'EN_PROCESO': '🔄 En proceso',
      'PENDIENTE': '⏳ Pendiente'
    };
    return estados[estado] || estado;
  }

  getEstadoClase(estado: string): string {
    const clases: Record<string, string> = {
      'CALIFICADO': 'estado-calificado',
      'EN_PROCESO': 'estado-proceso',
      'PENDIENTE': 'estado-pendiente'
    };
    return clases[estado] || '';
  }
}