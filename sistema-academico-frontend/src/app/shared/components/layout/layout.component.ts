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
  private router = inject(Router);
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