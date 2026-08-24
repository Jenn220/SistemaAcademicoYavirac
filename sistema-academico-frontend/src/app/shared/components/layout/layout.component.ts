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
  private router = inject(Router);
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