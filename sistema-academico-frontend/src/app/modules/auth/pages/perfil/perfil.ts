import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MeResponse } from '../../models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly authService = inject(AuthService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly perfil = signal<MeResponse | null>(null);

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (data) => {
        this.perfil.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu información de perfil.');
        this.cargando.set(false);
      },
    });
  }

  etiquetaRol(rol: string): string {
    const etiquetas: Record<string, string> = {
      DOCENTE: 'Docente',
      ESTUDIANTE: 'Estudiante',
      TUTOR_EMPRESARIAL: 'Tutor empresarial',
      COORDINADOR: 'Coordinador',
    };
    return etiquetas[rol] ?? rol;
  }
}
