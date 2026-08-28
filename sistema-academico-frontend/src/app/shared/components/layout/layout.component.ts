import { Component, signal, inject, computed, effect, OnInit } from '@angular/core';
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

  // ✅ AÑADIDO: Signal para el sidebar
  private sidebarAbiertoSignal = signal(false);
  sidebarAbierto = computed(() => this.sidebarAbiertoSignal());

  // Signal para el menú de usuario
  menuUsuarioAbierto = signal(false);
  notificacionesAbiertas = signal(false);

  protected notificaciones = computed(() => this.notificacionesService.notificaciones());

  // Computed para el nombre del usuario
  nombreUsuario = computed(() => {
    const u = this.authService.usuario();
    if (!u) return 'Usuario';
    return (u as any).nombreCompleto || (u as any).nombre || u.correo || 'Usuario';
  });

  // Computed para el rol del usuario
  rolUsuario = computed(() => {
    const roles = this.authService.roles();
    if (!roles || roles.length === 0) return 'Sin Rol';
    const primerRol = roles[0];
    return primerRol.charAt(0).toUpperCase() + primerRol.slice(1).toLowerCase();
  });

  constructor() {
    // ✅ AÑADIDO: Cerrar sidebar automáticamente en pantallas pequeñas
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  ngOnInit(): void {
    this.notificacionesService.iniciarPolling();
  }

  // ✅ AÑADIDO: Método para alternar el sidebar
  toggleSidebar(): void {
    this.sidebarAbiertoSignal.update(prev => !prev);
  }

  // Método para verificar roles en el HTML
  tieneRol(rol: string): boolean {
    return this.authService.roles().includes(rol);
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

  // ✅ AÑADIDO: Maneja el redimensionamiento de la ventana
  private handleResize(): void {
    const isSmallScreen = window.innerWidth <= 900;
    if (isSmallScreen) {
      this.sidebarAbiertoSignal.set(false);
    }
  }
}