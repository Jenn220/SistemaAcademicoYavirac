import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { NotificacionesService } from '../../../modules/fase-practica/services/notificaciones.service';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutShellComponent implements OnInit {
  protected router = inject(Router);
  protected authService = inject(AuthService);
  protected notificacionesService = inject(NotificacionesService);

  menuUsuarioAbierto = signal(false);
  notificacionesAbiertas = signal(false);

  protected notificaciones = computed(() => this.notificacionesService.notificaciones());

  nombreUsuario = computed(() => {
    const u = this.authService.usuario();
    if (!u) return 'Usuario';
    return (u as any).nombreCompleto || (u as any).nombre || u.correo || 'Usuario';
  });

  rolUsuario = computed(() => {
    const roles = this.authService.roles();
    if (!roles || roles.length === 0) return 'Sin Rol';
    const primerRol = roles[0];
    return primerRol.charAt(0).toUpperCase() + primerRol.slice(1).toLowerCase();
  });

  cantidadNotificaciones = computed(() => this.notificacionesService.cantidadNoLeidas());

  ngOnInit(): void {
    this.notificacionesService.iniciarPolling();
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto.update(v => !v);
  }

  toggleNotificaciones(): void {
    const abriendo = !this.notificacionesAbiertas();
    this.notificacionesAbiertas.set(abriendo);
    if (abriendo) {
      this.notificacionesService.cargarTodas();
    }
  }

  marcarComoLeida(idNotificacion: number): void {
    this.notificacionesService.marcarLeida(idNotificacion).subscribe(() => {
      this.notificacionesService.cargarTodas();
    });
  }

  cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto.set(false);
  }

  /**
   * Debe reflejar exactamente los mismos pares clave/destino que DESTINOS en
   * plan-formacion-lista.ts.
   */
  private readonly DESTINOS_PLAN_FORMACION: Record<string, string> = {
    marco: '/fase-practica/plan-marco',
    rotacion: '/fase-practica/plan-rotacion',
    'carta-compromiso': '/fase-practica/carta-compromiso',
    curriculum: '/fase-practica/curriculum',
    'registro-asistencia': '/fase-practica/registro-asistencia',
    'informe-aprendizaje': '/fase-practica/informe-aprendizaje',
    'evaluacion-empresarial': '/fase-practica/evaluacion-empresarial',
    'evaluacion-instituto': '/fase-practica/evaluacion-instituto',
    'acta-induccion-seguridad': '/fase-practica/acta-induccion-seguridad',
    'acta-entorno-laboral': '/fase-practica/acta-entorno-laboral',
  };

  /**
   * Todos los documentos de fase-práctica pasan por el selector
   * /fase-practica/plan-formacion?modo=X — para ESTUDIANTE ese selector
   * redirige de inmediato a la práctica propia (/fase-practica/X/:id); para
   * DOCENTE/COORDINADOR/TUTOR_EMPRESARIAL, elegir un estudiante de la lista
   * navega a esa misma URL final. routerLinkActive nunca marca esos links
   * porque la URL final ya no coincide con el routerLink+queryParams del
   * menú (que se quedó en /plan-formacion).
   */
  protected esModoActivo(modo: string): boolean {
    const url = this.router.url;
    const base = this.DESTINOS_PLAN_FORMACION[modo];
    if (base && url.startsWith(base)) return true;
    return url.startsWith('/fase-practica/plan-formacion') && url.includes(`modo=${modo}`);
  }

  cerrarSesion(): void {
    this.cerrarMenuUsuario();
    localStorage.clear();
    sessionStorage.clear();
    if (this.authService && typeof this.authService.logout === 'function') {
      this.authService.logout();
    }
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}