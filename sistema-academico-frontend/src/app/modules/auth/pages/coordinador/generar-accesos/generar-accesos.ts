import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { GenerarAccesosResponse, TipoGenerarAccesos } from '../../../models';

@Component({
  selector: 'app-generar-accesos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generar-accesos.html',
  styleUrl: './generar-accesos.scss',
})
export class GenerarAccesos {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultado = signal<GenerarAccesosResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    tipo: this.fb.nonNullable.control<TipoGenerarAccesos>('ESTUDIANTE', Validators.required),
    id_periodo: this.fb.control<number | null>(null),
  });

  readonly requierePeriodo = computed(() => this.form.controls.tipo.value === 'ESTUDIANTE');

  constructor() {
    // Mantiene la validación condicional de id_periodo sincronizada
    // con el DTO del backend (GenerarAccesosDto usa @ValidateIf tipo === 'ESTUDIANTE')
    this.form.controls.tipo.valueChanges.subscribe((tipo) => {
      const idPeriodo = this.form.controls.id_periodo;
      if (tipo === 'ESTUDIANTE') {
        idPeriodo.setValidators([Validators.required]);
      } else {
        idPeriodo.clearValidators();
        idPeriodo.setValue(null);
      }
      idPeriodo.updateValueAndValidity();
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.resultado.set(null);
    this.cargando.set(true);

    const { tipo, id_periodo } = this.form.getRawValue();

    this.authService
      .generarAccesos({
        tipo,
        id_periodo: tipo === 'ESTUDIANTE' ? id_periodo ?? undefined : undefined,
      })
      .subscribe({
        next: (respuesta) => {
          this.cargando.set(false);
          this.resultado.set(respuesta);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudieron generar los accesos. Intenta nuevamente.');
        },
      });
  }
}
