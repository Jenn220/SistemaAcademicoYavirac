import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GenerarAccesosResponse, TipoGenerarAccesos } from '../../../models';

export interface PeriodoAcademico {
  id_periodo: number;
  nombre: string;
  codigo: string;
}

@Component({
  selector: 'app-generar-accesos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './generar-accesos.html',
  styleUrl: './generar-accesos.scss',
})
export class GenerarAccesos {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly periodos = signal<PeriodoAcademico[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultado = signal<GenerarAccesosResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    tipo: this.fb.nonNullable.control<TipoGenerarAccesos>('ESTUDIANTE', Validators.required),
    id_periodo: this.fb.control<number | null>(null, Validators.required),
  });

  constructor() {
    this.authService.obtenerPeriodosActivos().subscribe({
      next: (data) => this.periodos.set(data),
      error: () => this.error.set('No se pudieron cargar los períodos académicos activos.'),
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('No se pudieron generar los accesos. Intenta nuevamente.');
      return;
    }

    this.error.set(null);
    this.resultado.set(null);
    this.cargando.set(true);

    const { tipo, id_periodo } = this.form.getRawValue();

    this.authService
      .generarAccesos({
        tipo,
        id_periodo: id_periodo!,
      })
      .subscribe({
        next: (respuesta) => {
          this.cargando.set(false);
          this.resultado.set(respuesta);
        },
        error: (err) => {
          this.cargando.set(false);
          const msg = Array.isArray(err?.error?.message)
            ? err.error.message.join(', ')
            : err?.error?.message || 'No se pudieron generar los accesos. Intenta nuevamente.';
          this.error.set(msg);
        },
      });
  }
}