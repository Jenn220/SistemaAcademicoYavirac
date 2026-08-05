import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CertificadoService } from '../../../services/certificado.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Certificado } from '../../../models/certificado.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-certificado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificado.html',
  styleUrls: ['./certificado.scss']
})
export class CertificadoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private certificadoService = inject(CertificadoService);
  private inicioService = inject(InicioActividadesService);
  private authService = inject(AuthService);

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
    this.isEstudiante = this.authService.roles().includes('ESTUDIANTE');

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
    this.certificadoService.obtenerCertificado(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.certificado = data;
          this.proyectoEdit = data.proyecto || '';
          this.fechaInicioEdit = data.fecha_inicio || '';
          this.fechaFinEdit = data.fecha_fin || '';
        },
        error: (err) => {
          this.error = 'No se pudo cargar el certificado.';
          console.error(err);
        }
      });
  }

  guardarCambios(): void {
    if (!this.certificado) return;
    this.loading = true;
    const payload = {
      nombre_proyecto: this.proyectoEdit,
      fecha_inicio: this.fechaInicioEdit
    };
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
          this.error = 'Error al guardar los cambios.';
          console.error(err);
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