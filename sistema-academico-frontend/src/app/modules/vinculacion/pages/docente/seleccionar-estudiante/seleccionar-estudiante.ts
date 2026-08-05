// modules/vinculacion/pages/docente/seleccionar-estudiante/seleccionar-estudiante.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-seleccionar-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccionar-estudiante.html',
  styleUrls: ['./seleccionar-estudiante.scss']
})
export class SeleccionarEstudianteComponent implements OnInit {
  private service = inject(VinculacionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  estudiantes: any[] = [];
  filtered: any[] = [];
  loading = true;
  error: string | null = null;
  terminoBusqueda: string = '';

  ngOnInit(): void {
    // 🔥 Verificar rol usando el método existente
    if (!this.authService.tieneAlgunRol(['DOCENTE'])) {
      this.error = '⚠️ No tienes permisos de docente para ver esta pantalla.';
      this.loading = false;
      return;
    }
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.loading = true;
    this.error = null;
    this.service.obtenerEstudiantesAsignados()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data: any[]) => {
          this.estudiantes = data.map(item => ({
            id_vinculacion: item.id_vinculacion || item.id,
            nombre: item.estudiante_nombre || item.estudiante || 'N/A',
            cedula: item.cedula || 'N/A',
            empresa: item.entidad_beneficiaria || item.empresa || 'N/A',
            tutor_empresarial: item.tutor_entidad || item.tutor || 'N/A'
          }));
          this.filtered = this.estudiantes;
        },
        error: (err: any) => {
          if (err.status === 404 || err.status === 403) {
            this.error = '⚠️ El backend no está respondiendo correctamente. Verifica que el servidor esté corriendo y que el endpoint /vinculacion/informe-final esté disponible.';
          } else {
            this.error = 'Ocurrió un error al cargar los estudiantes. Por favor, intenta nuevamente.';
          }
          console.warn('Error controlado:', err);
        }
      });
  }

  buscar(): void {
    const term = this.terminoBusqueda.toLowerCase().trim();
    if (!term) {
      this.filtered = this.estudiantes;
      return;
    }
    this.filtered = this.estudiantes.filter(est =>
      est.nombre?.toLowerCase().includes(term) ||
      est.cedula?.includes(term) ||
      est.empresa?.toLowerCase().includes(term)
    );
  }

  seleccionarEstudiante(idVinculacion: number): void {
    this.router.navigate(['/vinculacion/docente/estudiante', idVinculacion, 'registro-asistencia-tutor']);
  }
}