import { Component, signal, inject } from '@angular/core';
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