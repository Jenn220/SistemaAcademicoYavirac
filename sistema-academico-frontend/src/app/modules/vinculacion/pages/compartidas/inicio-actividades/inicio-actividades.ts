import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { InicioActividadesResponse } from '../../../models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-inicio-actividades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-actividades.html',
  styleUrls: ['./inicio-actividades.scss']
})
export class InicioActividadesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InicioActividadesService);
  private authService = inject(AuthService);

  data: InicioActividadesResponse | null = null;
  isLoading = true;
  error: string | null = null;
  idVinculacion: number = 0;
  isEstudiante = false;

  ngOnInit(): void {
    // SOLO ESTUDIANTE puede ver esta pantalla
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
      this.isLoading = false;
      return;
    }

    this.route.params.subscribe(params => {
      this.idVinculacion = params['id'] ? +params['id'] : 0;
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
  this.isLoading = true;
  this.error = null;
  
  console.log('🔵 Cargando datos para vinculación:', this.idVinculacion);
  
  this.service.obtenerInicioActividades(this.idVinculacion)
    .subscribe({
      next: (response) => {
        console.log('📦 Datos recibidos:', response);
        console.log('📦 ¿data es null?', this.data === null);
        console.log('📦 ¿isLoading antes?', this.isLoading);
        this.data = response;
        this.isLoading = false;
        console.log('📦 isLoading después:', this.isLoading);
        console.log('📦 data después:', this.data);
      },
      error: (err) => {
        console.error('❌ Error al cargar Inicio Actividades:', err);
        this.error = 'No se pudieron cargar los datos.';
        this.isLoading = false;
      }
    });
}
}