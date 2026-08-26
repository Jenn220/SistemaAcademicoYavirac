import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { AuthService } from '../../../auth/services/auth.service';

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
  rolUsuario: string = '';

  get nombreUsuario(): string {
    return this.authService.nombreUsuario();
  }

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.rolUsuario = this.authService.roles()[0] || 'USUARIO';
    
    console.log('👤 Usuario autenticado:', this.authService.usuario());
    console.log('📛 Nombre completo:', this.nombreUsuario);
    
    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data;
        this.isLoading = false;
        console.log('✅ Dashboard cargado para rol:', this.rolUsuario);
        console.log('📊 Estadísticas:', this.stats);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error = 'Error al cargar estadísticas';
        this.stats = this.getDatosPorDefecto();
        this.isLoading = false;
      }
    });
  }

  private getDatosPorDefecto(): DashboardStats {
    const rol = this.authService.roles()[0] || 'ESTUDIANTE';
    switch(rol) {
      case 'COORDINADOR':
        return {
          estudiantes: { total: 1248, crecimiento: 8.2 },
          docentes: { total: 86, crecimiento: 3.1 },
          carreras: { total: 12, crecimiento: 1 },
          materias: { total: 256, crecimiento: 6.4 }
        };
      case 'DOCENTE':
        return {
          estudiantes: { total: 45, crecimiento: 2.5 },
          docentes: { total: 1, crecimiento: 0 },
          carreras: { total: 3, crecimiento: 0.5 },
          materias: { total: 4, crecimiento: 1.2 }
        };
      case 'EMPRESA':
        return {
          estudiantes: { total: 12, crecimiento: 3.0 },
          docentes: { total: 2, crecimiento: 0 },
          carreras: { total: 2, crecimiento: 0 },
          materias: { total: 8, crecimiento: 1.5 }
        };
      default:
        return {
          estudiantes: { total: 1, crecimiento: 0 },
          docentes: { total: 5, crecimiento: 0 },
          carreras: { total: 1, crecimiento: 0 },
          materias: { total: 6, crecimiento: 0 }
        };
    }
  }

  refrescar() {
    this.isLoading = true;
    this.error = null;
    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.stats = this.getDatosPorDefecto();
        this.isLoading = false;
        this.error = 'Error al refrescar';
      }
    });
  }
}