import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss',
})
export class Unauthorized {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly correo = this.authService.usuario()?.correo ?? null;

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
