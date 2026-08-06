import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { InicioActividadesResponse } from '../../../models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-inicio-actividades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-actividades.component.html',
  styleUrls: ['./inicio-actividades.component.scss']
})
export class InicioActividadesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InicioActividadesService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);

  data: InicioActividadesResponse | null = null;
  isLoading = true;
  error: string | null = null;
  idVinculacion: number = 0;
  isEstudiante = false;

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    const idParam = this.route.snapshot.params['id'];
    
    if (idParam && idParam > 0) {
      this.idVinculacion = Number(idParam);
      this.cargarDatos();
    } else {
      this.obtenerVinculacionActiva();
    }
  }

  obtenerVinculacionActiva(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.isLoading = false;
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
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
          this.cdr.markForCheck();
        }
      });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    console.log('🔵 Cargando Inicio Actividades para vinculación:', this.idVinculacion);
    
    this.service.obtenerInicioActividades(this.idVinculacion)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          console.log('📦 Datos de Inicio Actividades recibidos:', response);
          this.data = response;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Inicio Actividades:', err);
          this.error = 'No se pudieron cargar los datos.';
          this.cdr.markForCheck();
        }
      });
  }
}