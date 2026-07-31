import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';

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
export class LayoutShellComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);

  menuUsuarioAbierto = signal(false);

  // Signal computado para obtener el nombre del usuario o su correo como alternativa
  nombreUsuario = computed(() => {
    const u = this.authService.usuario();
    if (!u) return 'Usuario';
    return (u as any).nombreCompleto || (u as any).nombre || u.correo || 'Usuario';
  });

  // Signal computado para obtener y formatear el rol (ej: "COORDINADOR" -> "Coordinador")
  rolUsuario = computed(() => {
    const roles = this.authService.roles();
    if (!roles || roles.length === 0) return 'Sin Rol';

    const primerRol = roles[0];
    return primerRol.charAt(0).toUpperCase() + primerRol.slice(1).toLowerCase();
  });

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto.update(v => !v);
  }

  cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto.set(false);
  }

  cerrarSesion(): void {
    this.cerrarMenuUsuario();

    // 1. Limpiamos cualquier token o sesión guardada
    localStorage.clear();
    sessionStorage.clear();

    // 2. Si el servicio tiene método logout, lo ejecutamos
    if (this.authService && typeof this.authService.logout === 'function') {
      this.authService.logout();
    }

    // 3. Redirección forzada e inmediata al Login
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}