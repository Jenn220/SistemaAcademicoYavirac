import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  private cdr = inject(ChangeDetectorRef);

  estudiantes: EstudianteDocente[] = [];
  filtered: EstudianteDocente[] = [];
  loading = true;
  error: string | null = null;
  terminoBusqueda: string = '';

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
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los estudiantes.';
          console.error(err);
          this.cdr.markForCheck();
        }
      });
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

  seleccionarEstudiante(idVinculacion: number): void {
    this.router.navigate(['/vinculacion/docente/estudiante', idVinculacion, 'registro-asistencia-tutor']);
  }
}