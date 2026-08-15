import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  stats: DashboardStats = {
    estudiantes: { total: 0, crecimiento: 0 },
    docentes: { total: 0, crecimiento: 0 },
    carreras: { total: 0, crecimiento: 0 },
    materias: { total: 0, crecimiento: 0 }
  };

  isLoading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar estadísticas:', err);
        this.error = 'No se pudieron cargar las estadísticas';
        this.isLoading = false;
        this.cargarDatosRespaldo();
      }
    });
  }

  private cargarDatosRespaldo() {
    this.stats = {
      estudiantes: { total: 1248, crecimiento: 8.2 },
      docentes: { total: 86, crecimiento: 3.1 },
      carreras: { total: 12, crecimiento: 1 },
      materias: { total: 256, crecimiento: 6.4 }
    };
  }
}