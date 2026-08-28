import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export interface DashboardStats {
  estudiantes: { total: number; crecimiento: number };
  docentes: { total: number; crecimiento: number };
  carreras: { total: number; crecimiento: number };
  materias: { total: number; crecimiento: number };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private authService: AuthService) {}

  // Método principal - SOLO datos locales, SIN llamadas HTTP
  getStats(): Observable<DashboardStats> {
    const rol = this.authService.roles()[0] || 'ESTUDIANTE';
    const stats = this.getStatsPorRol(rol);
    return of(stats);
  }

  private getStatsPorRol(rol: string): DashboardStats {
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
      case 'ESTUDIANTE':
      default:
        return {
          estudiantes: { total: 1, crecimiento: 0 },
          docentes: { total: 5, crecimiento: 0 },
          carreras: { total: 1, crecimiento: 0 },
          materias: { total: 6, crecimiento: 0 }
        };
    }
  }
}