import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { InicioActividadesResponse } from '../../../models';

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

  data: InicioActividadesResponse | null = null;
  isLoading = true;
  error: string | null = null;
  idVinculacion: number | null = null;

  ngOnInit(): void {
    // Obtener ID de vinculación de la URL (para docente) o usar el del estudiante
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idVinculacion = +params['id'];
      } else {
        // Para estudiante, el backend resuelve el ID automáticamente, pasamos 0
        this.idVinculacion = 0;
      }
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.error = null;
    this.service.obtenerInicioActividades(this.idVinculacion!).subscribe({
      next: (response) => {
        this.data = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar Inicio Actividades:', err);
        this.error = 'No se pudieron cargar los datos.';
        this.isLoading = false;
      }
    });
  }
}