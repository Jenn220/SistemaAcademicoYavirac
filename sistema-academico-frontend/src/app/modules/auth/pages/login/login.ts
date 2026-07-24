import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly mostrarPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  get correo() {
    return this.form.controls.correo;
  }

  get password() {
    return this.form.controls.password;
  }

  alternarPassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.debeCambiarPassword) {
          this.router.navigate(['/auth/cambiar-password']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorMensaje.set(this.mapearError(error));
      },
    });
  }

  private mapearError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Correo o contraseña incorrectos.';
    }
    if (error.status === 403) {
      return (
        error.error?.message ??
        'Cuenta bloqueada por intentos fallidos. Solicita el desbloqueo al coordinador.'
      );
    }
    return 'No se pudo iniciar sesión. Intenta nuevamente en unos minutos.';
  }
}