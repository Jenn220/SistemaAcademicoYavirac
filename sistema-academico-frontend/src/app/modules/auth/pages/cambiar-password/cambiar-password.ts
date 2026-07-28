import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

function passwordsCoinciden(control: AbstractControl): ValidationErrors | null {
  const nueva = control.get('passwordNueva')?.value;
  const confirmacion = control.get('confirmacion')?.value;
  if (!nueva || !confirmacion) {
    return null;
  }
  return nueva === confirmacion ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cambiar-password.html',
  styleUrl: './cambiar-password.scss',
})
export class CambiarPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      passwordActual: [''],
      passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: passwordsCoinciden },
  );

  get passwordNueva() {
    return this.form.controls.passwordNueva;
  }

  get confirmacion() {
    return this.form.controls.confirmacion;
  }

  enviar(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.error.set(null);
  this.exito.set(false);
  this.cargando.set(true);

  const { passwordActual, passwordNueva } = this.form.getRawValue();

  this.authService
    .cambiarPassword({
      passwordActual: passwordActual?.trim() ? passwordActual : undefined,
      passwordNueva,
    })
    .subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set(true);
        this.form.reset();

        // 1. Cerramos la sesión antigua para limpiar el token viejo
        this.authService.logout();

        // 2. Redirigimos al Login tras 1.5s para que entre con la NUEVA contraseña
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { cambiado: 'true' }
          });
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        const mensajeServidor = error.error?.message;
        this.error.set(
          mensajeServidor || 'No se pudo actualizar la contraseña. Verifica los datos.'
        );
      },
    });
  }
}
