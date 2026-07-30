import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { PlanFormacion } from '../../services/plan-formacion';
import { DocumentHeader } from '../../components/document-header/document-header';
import { ItemPlanMarco, PlanMarcoFormacion, PlanRotacion as PlanRotacionModel, PracticaSelector } from '../../interfaces';
import { exportarDocumentoWord } from '../../utils/exportar-word';

const NUMERO_SEMANAS_MINIMO = 8;

interface EncabezadoPlanRotacion {
  estudianteNombre: string;
  periodo: string;
  carrera: string;
  nivel: string;
  empresaFormadora: string;
  tutorAcademicoNombre: string;
  tutorEmpresarialNombre: string;
  /** Reciclados del Plan Marco de la misma práctica, no se piden dos veces */
  horasFormacion?: number;
  nucleoEstructurante: string;
}

/**
 * "Competencias necesarias" del Formato 04: al igual que Plan Marco no
 * tiene columnas para esto en la BD, así que se llenan a mano y viajan
 * en el Word, pero no se guardan todavía (mismo criterio que estudiante/
 * carrera/nivel en el encabezado).
 */
interface CompetenciasNecesarias {
  conocimientosTeoricos: string;
  procedimentales: string;
  actitudinales: string;
}

interface FilaRotacion {
  item: ItemPlanMarco;
  planRotacion: PlanRotacionModel;
  semanasActivas: Set<number>;
  /** semana -> id_rotacion_semana, solo para lo que ya está guardado */
  semanasGuardadas: Map<number, number>;
}

function encabezadoVacio(): EncabezadoPlanRotacion {
  return {
    estudianteNombre: '',
    periodo: '',
    carrera: '',
    nivel: '',
    empresaFormadora: '',
    tutorAcademicoNombre: '',
    tutorEmpresarialNombre: '',
    horasFormacion: undefined,
    nucleoEstructurante: ''
  };
}

function competenciasVacias(): CompetenciasNecesarias {
  return { conocimientosTeoricos: '', procedimentales: '', actitudinales: '' };
}

@Component({
  selector: 'app-plan-rotacion',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './plan-rotacion.html',
  styleUrl: './plan-rotacion.scss'
})
export class PlanRotacion implements OnInit {

  private planFormacion = inject(PlanFormacion);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  idPractica = 0;

  encabezado: EncabezadoPlanRotacion = encabezadoVacio();

  competencias: CompetenciasNecesarias = competenciasVacias();

  filas: FilaRotacion[] = [];

  numeroSemanas = NUMERO_SEMANAS_MINIMO;

  cargando = false;

  guardando = false;

  /** null mientras carga; string cuando falta el Plan Marco previo */
  error: string | null = null;

  ngOnInit(): void {

    this.idPractica = Number(this.route.snapshot.paramMap.get('idPractica'));

    this.cargar();

  }

  get columnasSemanas(): number[] {
    return Array.from({ length: this.numeroSemanas }, (_, i) => i + 1);
  }

  private cargar(): void {

    this.cargando = true;
    this.error = null;

    forkJoin({
      practica: this.planFormacion.obtenerPractica(this.idPractica).pipe(catchError(() => of(null as PracticaSelector | null))),
      planesMarco: this.planFormacion.obtenerPlanMarcoPorPractica(this.idPractica).pipe(catchError(() => of([])))
    }).subscribe({

      next: ({ practica, planesMarco }) => {

        if (practica) {
          this.encabezado.empresaFormadora = practica.empresa?.razon_social ?? '';
          this.encabezado.tutorEmpresarialNombre = practica.tutor_empresarial
            ? `${practica.tutor_empresarial.nombres} ${practica.tutor_empresarial.apellidos}`
            : '';
        }

        if (planesMarco.length === 0) {
          this.error = 'Esta práctica todavía no tiene un Plan Marco de Formación. Créalo primero para poder definir el Plan de Rotación.';
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        const planMarco: PlanMarcoFormacion = planesMarco[0];

        // Horas de formación ya se guardaron al crear el Plan Marco de esta
        // práctica: se reutiliza en vez de volver a pedirla.
        this.encabezado.horasFormacion = planMarco.horas_formacion;

        this.planFormacion.listarItemsPlanMarco(planMarco.id_plan_marco!).subscribe({

          next: (items) => {

            if (items.length === 0) {
              this.error = 'El Plan Marco de esta práctica todavía no tiene resultados de aprendizaje.';
              this.cargando = false;
              this.cdr.detectChanges();
              return;
            }

            this.cargarFilas(items);

          },

          error: () => {
            this.error = 'No fue posible cargar los resultados de aprendizaje del Plan Marco.';
            this.cargando = false;
            this.cdr.detectChanges();
          }

        });

      },

      error: () => {
        this.error = 'No fue posible cargar la práctica.';
        this.cargando = false;
        this.cdr.detectChanges();
      }

    });

  }

  private cargarFilas(items: ItemPlanMarco[]): void {

    this.planFormacion.listarPlanRotacionPorPractica(this.idPractica).subscribe({

      next: (rotaciones) => {

        const porItem = new Map(rotaciones.map((r) => [r.id_item_pm, r]));

        const filas: FilaRotacion[] = items.map((item) => ({
          item,
          planRotacion: porItem.get(item.id_item_pm!) ?? {
            id_practica: this.idPractica,
            id_item_pm: item.id_item_pm!,
            puesto_aprendizaje: item.puesto_aprendizaje
          },
          semanasActivas: new Set<number>(),
          semanasGuardadas: new Map<number, number>()
        }));

        const cargasSemanas = filas
          .filter((f) => f.planRotacion.id_plan_rotacion)
          .map((f) => this.planFormacion.listarSemanas(f.planRotacion.id_plan_rotacion!).pipe(
            tap((semanas) => {
              semanas.forEach((s) => {
                f.semanasGuardadas.set(s.semana, s.id_rotacion_semana!);
                f.semanasActivas.add(s.semana);
              });
            })
          ));

        const finalizarCarga = () => {
          this.filas = filas;
          this.recalcularNumeroSemanas();
          this.cargando = false;
          this.cdr.detectChanges();
        };

        if (cargasSemanas.length === 0) {
          finalizarCarga();
          return;
        }

        forkJoin(cargasSemanas).subscribe({ next: finalizarCarga, error: finalizarCarga });

      },

      error: () => {
        this.error = 'No fue posible cargar el Plan de Rotación.';
        this.cargando = false;
        this.cdr.detectChanges();
      }

    });

  }

  private recalcularNumeroSemanas(): void {

    const semanasActivas = this.filas.flatMap((f) => [...f.semanasActivas]);
    const semanasSugeridas = this.filas.map((f) => f.item.semanas || 0);

    this.numeroSemanas = Math.max(NUMERO_SEMANAS_MINIMO, ...semanasActivas, ...semanasSugeridas);

  }

  agregarSemana(): void {
    this.numeroSemanas++;
  }

  quitarSemana(): void {

    if (this.numeroSemanas <= 1) return;

    this.filas.forEach((f) => {
      f.semanasActivas.delete(this.numeroSemanas);
    });

    this.numeroSemanas--;

  }

  toggleSemana(fila: FilaRotacion, semana: number): void {

    if (fila.semanasActivas.has(semana)) {
      fila.semanasActivas.delete(semana);
    } else {
      fila.semanasActivas.add(semana);
    }

  }

  volver(): void {
    this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'rotacion' } });
  }

  descargarWord(): void {
    exportarDocumentoWord('documento-plan-rotacion', 'Plan_Rotacion', 'landscape');
  }

  guardarEnBD(): void {

    if (this.guardando || this.filas.length === 0) return;

    this.guardando = true;

    const operaciones = this.filas.map((fila) => this.guardarFila(fila));

    forkJoin(operaciones).subscribe({

      next: () => {

        Swal.fire('Plan de Rotación guardado', 'Las semanas de rotación se guardaron correctamente.', 'success');

        // Se recarga desde el back para tener ids reales de plan_rotacion /
        // plan_rotacion_semana en vez de mantener el estado optimista local.
        this.cargar();

      },

      error: () => {
        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar el Plan de Rotación.', 'error');
      }

    });

  }

  private guardarFila(fila: FilaRotacion): Observable<void> {

    const asegurarPlanRotacion$ = fila.planRotacion.id_plan_rotacion
      ? this.planFormacion.actualizarPlanRotacion(fila.planRotacion.id_plan_rotacion, {
          puesto_aprendizaje: fila.planRotacion.puesto_aprendizaje
        })
      : this.planFormacion.crearPlanRotacion({
          id_practica: this.idPractica,
          id_item_pm: fila.item.id_item_pm!,
          puesto_aprendizaje: fila.planRotacion.puesto_aprendizaje
        });

    return asegurarPlanRotacion$.pipe(

      switchMap((planRotacionGuardado) => {

        fila.planRotacion = planRotacionGuardado;

        const idPlanRotacion = planRotacionGuardado.id_plan_rotacion!;

        const aCrear = [...fila.semanasActivas].filter((s) => !fila.semanasGuardadas.has(s));
        const aEliminar = [...fila.semanasGuardadas.keys()].filter((s) => !fila.semanasActivas.has(s));

        const cambios: Observable<unknown>[] = [
          ...aCrear.map((s) => this.planFormacion.crearSemana(idPlanRotacion, s)),
          ...aEliminar.map((s) => this.planFormacion.eliminarSemana(fila.semanasGuardadas.get(s)!))
        ];

        if (cambios.length === 0) return of(void 0);

        return forkJoin(cambios).pipe(map(() => void 0));

      })

    );

  }

}
