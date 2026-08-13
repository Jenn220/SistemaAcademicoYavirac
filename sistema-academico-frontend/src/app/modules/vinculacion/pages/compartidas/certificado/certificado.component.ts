import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CertificadoService } from '../../../services/certificado.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { ControlAsistenciaService } from '../../../services/control-asistencia.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { Certificado } from '../../../models/certificado.model';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-certificado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss']
})
export class CertificadoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private certificadoService = inject(CertificadoService);
  private inicioService = inject(InicioActividadesService);
  private controlAsistenciaService = inject(ControlAsistenciaService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);

  certificado: Certificado | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  // Datos combinados
  proyectoNombre: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  totalHoras: number = 0;

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
        error: (err: any) => {
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
    console.log('🔵 Cargando Certificado para vinculación:', this.idVinculacion);
    
    // Cargar datos en paralelo
    forkJoin({
      certificado: this.certificadoService.obtenerCertificado(this.idVinculacion),
      inicioActividades: this.inicioService.obtenerInicioActividades(this.idVinculacion),
      asistencia: this.controlAsistenciaService.obtenerAsistencia(this.idVinculacion)
    })
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    }))
    .subscribe({
      next: (result) => {
        console.log('📦 Datos combinados:', result);
        
        // Datos base del certificado
        this.certificado = result.certificado;
        
        // Datos desde inicio-actividades
        if (result.inicioActividades) {
          this.proyectoNombre = result.inicioActividades.proyecto_nombre || '';
          
          // Normalizar fechas
          let fechaInicioRaw = result.inicioActividades.fecha_inicio || '';
          let fechaFinRaw = result.inicioActividades.fecha_fin || '';
          
          // Si el backend devuelve ISO string (con T), extraer solo la fecha
          if (fechaInicioRaw && fechaInicioRaw.includes('T')) {
            this.fechaInicio = fechaInicioRaw.split('T')[0];
          } else {
            this.fechaInicio = fechaInicioRaw;
          }
          
          if (fechaFinRaw && fechaFinRaw.includes('T')) {
            this.fechaFin = fechaFinRaw.split('T')[0];
          } else {
            this.fechaFin = fechaFinRaw;
          }
        }
        
        // Total horas desde control-asistencia
        if (result.asistencia && result.asistencia.totales) {
          this.totalHoras = result.asistencia.totales.total_horas || 0;
        }
        
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar datos:', err);
        this.error = 'No se pudo cargar el certificado.';
        this.cdr.markForCheck();
      }
    });
  }

  // ============================================
  // UTILIDADES
  // ============================================
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }
}