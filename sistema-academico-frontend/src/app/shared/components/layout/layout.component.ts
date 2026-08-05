import { Component, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutShellComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  menuUsuarioAbierto = signal(false);

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

  // Método para verificar roles en el HTML
  tieneRol(rol: string): boolean {
    return this.authService.roles().includes(rol);
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto.update(v => !v);
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