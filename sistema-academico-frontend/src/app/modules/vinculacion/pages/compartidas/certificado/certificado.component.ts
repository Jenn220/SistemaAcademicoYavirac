import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CertificadoService } from '../../../services/certificado.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { Certificado } from '../../../models/certificado.model';
import { finalize } from 'rxjs/operators';

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
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);

  certificado: Certificado | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;
  editando = false;

  proyectoEdit: string = '';
  fechaInicioEdit: string = '';
  fechaFinEdit: string = '';

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
      this.loading = false;
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else {
        // ✅ Si no viene ID en la URL, obtener vinculación activa del estudiante
        this.obtenerVinculacionActiva();
      }
    });
  }

  /**
   * ✅ Obtener vinculación activa del estudiante autenticado
   */
  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();
          } else {
            this.error = 'No se encontró una vinculación activa para este estudiante.';
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    console.log('🔵 Cargando Certificado para vinculación:', this.idVinculacion);
    
    this.certificadoService.obtenerCertificado(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de Certificado recibidos:', data);
          this.certificado = data;
          this.proyectoEdit = data.proyecto || '';
          this.fechaInicioEdit = data.fecha_inicio || '';
          this.fechaFinEdit = data.fecha_fin || '';
        },
        error: (err) => {
          console.error('❌ Error al cargar Certificado:', err);
          this.error = 'No se pudo cargar el certificado.';
        }
      });
  }

  guardarCambios(): void {
    if (!this.certificado) return;
    this.loading = true;
    const payload: any = {};
    if (this.proyectoEdit) payload.nombre_proyecto = this.proyectoEdit;
    if (this.fechaInicioEdit) payload.fecha_inicio = this.fechaInicioEdit;

    this.inicioService.actualizarInicioActividades(this.idVinculacion, payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          if (this.certificado) {
            this.certificado.proyecto = this.proyectoEdit;
            this.certificado.fecha_inicio = this.fechaInicioEdit;
          }
          this.editando = false;
        },
        error: (err) => {
          console.error('❌ Error al guardar cambios:', err);
          this.error = 'Error al guardar los cambios.';
        }
      });
  }

  toggleEdit(): void {
    this.editando = !this.editando;
    if (!this.editando && this.certificado) {
      this.proyectoEdit = this.certificado.proyecto || '';
      this.fechaInicioEdit = this.certificado.fecha_inicio || '';
      this.fechaFinEdit = this.certificado.fecha_fin || '';
    }
  }
}