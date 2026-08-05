import { Component, signal, computed, inject } from '@angular/core';
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

  // Usar las señales del AuthService (son readonly)
  readonly usuario = this.authService.usuario;
  readonly roles = this.authService.roles;

  // Computed para mostrar el nombre y rol en la barra superior
  nombreUsuario = computed(() => {
    const user = this.usuario();
    return user?.correo || 'Usuario';
  });

  rolPrincipal = computed(() => {
    const roles = this.roles();
    if (roles.includes('DOCENTE')) return 'Docente';
    if (roles.includes('ESTUDIANTE')) return 'Estudiante';
    if (roles.includes('COORDINADOR')) return 'Coordinador';
    if (roles.includes('TUTOR_EMPRESARIAL')) return 'Tutor Empresarial';
    return 'Usuario';
  });

  // Método para verificar si el usuario tiene un rol específico
  tieneRol(rol: string): boolean {
    return this.roles().includes(rol);
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto.update(v => !v);
  }

  cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto.set(false);
  }

  cerrarSesion(): void {
    this.cerrarMenuUsuario();
    this.authService.logout();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}