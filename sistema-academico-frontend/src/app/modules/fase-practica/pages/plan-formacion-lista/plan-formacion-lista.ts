import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { PlanFormacion } from '../../services/plan-formacion';
import { PracticaSelector } from '../../interfaces';
import { AuthService } from '../../../auth/services/auth.service';

type ModoPlan =
  | 'marco'
  | 'rotacion'
  | 'carta-compromiso'
  | 'curriculum'
  | 'registro-asistencia'
  | 'informe-aprendizaje'
  | 'evaluacion-empresarial'
  | 'evaluacion-instituto'
  | 'acta-induccion-seguridad'
  | 'acta-entorno-laboral';

const DESTINOS: Record<ModoPlan, string> = {
  'marco': '/fase-practica/plan-marco',
  'rotacion': '/fase-practica/plan-rotacion',
  'carta-compromiso': '/fase-practica/carta-compromiso',
  'curriculum': '/fase-practica/curriculum',
  'registro-asistencia': '/fase-practica/registro-asistencia',
  'informe-aprendizaje': '/fase-practica/informe-aprendizaje',
  'evaluacion-empresarial': '/fase-practica/evaluacion-empresarial',
  'evaluacion-instituto': '/fase-practica/evaluacion-instituto',
  'acta-induccion-seguridad': '/fase-practica/acta-induccion-seguridad',
  'acta-entorno-laboral': '/fase-practica/acta-entorno-laboral',
};

const TITULOS: Record<ModoPlan, string> = {
  'marco': 'Plan Marco de Formación',
  'rotacion': 'Plan de Rotación',
  'carta-compromiso': 'Carta Compromiso',
  'curriculum': 'Currículo',
  'registro-asistencia': 'Registro de Asistencia',
  'informe-aprendizaje': 'Informe de Aprendizaje',
  'evaluacion-empresarial': 'Evaluación Empresarial',
  'evaluacion-instituto': 'Evaluación Instituto',
  'acta-induccion-seguridad': 'Acta Inducción Seguridad',
  'acta-entorno-laboral': 'Acta Entorno Laboral',
};

/**
 * Selector genérico de práctica para todos los documentos de fase-práctica.
 * El ESTUDIANTE siempre edita/consulta el suyo (autoservicio): se salta
 * este selector y va directo a su propia práctica vía /mi-practica.
 * DOCENTE/COORDINADOR/TUTOR_EMPRESARIAL necesitan elegir de una lista a
 * qué estudiante quieren ver — este selector sigue el mismo patrón de
 * portafolio-docente/lista-portafolio para esos 3 roles. Qué documento
 * abrir después de elegir se decide con el query param ?modo=.
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
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  practicas = signal<PracticaSelector[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  busqueda = signal('');

  practicasFiltradas = computed(() => {

    const texto = this.busqueda().trim().toLowerCase();

    if (!texto) return this.practicas();

    return this.practicas().filter((p) => {
      const nombre = p.estudiante?.nombre?.toLowerCase() ?? '';
      const cedula = p.estudiante?.cedula?.toLowerCase() ?? '';
      const empresa = p.empresa?.razon_social?.toLowerCase() ?? '';
      return nombre.includes(texto) || cedula.includes(texto) || empresa.includes(texto);
    });

  });

  private modoParam = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap
  });

  modo = computed<ModoPlan>(() => {
    const valor = this.modoParam().get('modo');
    return (valor && valor in DESTINOS ? valor : 'marco') as ModoPlan;
  });

  titulo = computed(() => TITULOS[this.modo()]);

  ngOnInit(): void {

    if (this.authService.tieneAlgunRol(['ESTUDIANTE'])) {
      this.irAMiPractica();
      return;
    }

    this.cargar();

  }

  private irAMiPractica(): void {

    this.planFormacion.obtenerMiPractica().subscribe({

      next: ({ id_practica }) => {
        this.router.navigate([DESTINOS[this.modo()], id_practica], { replaceUrl: true });
      },

      error: () => {
        this.error.set('No fue posible cargar tu práctica.');
        this.cargando.set(false);
      }

    });

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

  nombreEstudiante(practica: PracticaSelector): string {
    return practica.estudiante?.nombre ?? 'Estudiante sin asignar';
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
  }

  nombreTutor(practica: PracticaSelector): string {
    if (!practica.tutor_empresarial) return '—';
    return `${practica.tutor_empresarial.nombres} ${practica.tutor_empresarial.apellidos}`;
  }

  seleccionar(practica: PracticaSelector): void {
    this.router.navigate([DESTINOS[this.modo()], practica.id_practica]);
  }

}
