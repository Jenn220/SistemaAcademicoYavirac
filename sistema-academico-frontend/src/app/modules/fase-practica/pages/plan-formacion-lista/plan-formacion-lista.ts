import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { PlanFormacion } from '../../services/plan-formacion';
import { PracticaSelector } from '../../interfaces';

type ModoPlan = 'marco' | 'rotacion';

/**
 * Plan Marco e Plan de Rotación exigen elegir una práctica antes de poder
 * abrir el formulario (el back no resuelve la práctica del usuario
 * logueado para estos dos formatos, solo para los demás documentos de
 * este módulo). Este selector sigue el mismo patrón de
 * portafolio-docente/lista-portafolio: una sola pantalla, el modo llega
 * por query param (?modo=marco | ?modo=rotacion) desde el sidebar.
 */
@Component({
  selector: 'app-plan-formacion-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-formacion-lista.html',
  styleUrl: './plan-formacion-lista.scss'
})
export class PlanFormacionLista implements OnInit {

  private planFormacion = inject(PlanFormacion);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  practicas = signal<PracticaSelector[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  private modoParam = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap
  });

  modo = computed<ModoPlan>(() => (this.modoParam().get('modo') === 'rotacion' ? 'rotacion' : 'marco'));

  titulo = computed(() => (this.modo() === 'rotacion' ? 'Plan de Rotación' : 'Plan Marco de Formación'));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

    this.cargando.set(true);
    this.error.set(null);

    this.planFormacion.listarPracticas().subscribe({

      next: (practicas) => {
        this.practicas.set(practicas);
        this.cargando.set(false);
      },

      error: () => {
        this.error.set('No se pudieron cargar las prácticas.');
        this.cargando.set(false);
      }

    });

  }

  nombreEmpresa(practica: PracticaSelector): string {
    return practica.empresa?.razon_social ?? 'Empresa sin asignar';
  }

  nombreTutor(practica: PracticaSelector): string {
    if (!practica.tutor_empresarial) return '—';
    return `${practica.tutor_empresarial.nombres} ${practica.tutor_empresarial.apellidos}`;
  }

  seleccionar(practica: PracticaSelector): void {
    const destino = this.modo() === 'rotacion' ? '/fase-practica/plan-rotacion' : '/fase-practica/plan-marco';
    this.router.navigate([destino, practica.id_practica]);
  }

}
