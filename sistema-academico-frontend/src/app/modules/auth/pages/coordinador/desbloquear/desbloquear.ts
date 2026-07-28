import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router'; // <--- Importamos RouterLink
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { DesbloquearResponse } from '../../../models';

@Component({
  selector: 'app-desbloquear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // <--- Agregado aquí
  templateUrl: './desbloquear.html',
  styleUrl: './desbloquear.scss',
})
export class Desbloquear {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultado = signal<DesbloquearResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required]],
  });

  get correo() {
    return this.form.controls.correo;
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.resultado.set(null);
    this.cargando.set(true);

    this.authService.desbloquear(this.form.getRawValue()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.resultado.set(respuesta);
        this.form.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          error.status === 404
            ? 'No se encontró una cédula/RUC para resetear la contraseña de este usuario.'
            : 'No se pudo desbloquear la cuenta. Intenta nuevamente.',
        );
      },
    });
  }
}