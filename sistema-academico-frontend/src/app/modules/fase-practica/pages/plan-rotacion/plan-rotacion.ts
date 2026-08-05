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
import { Documentos } from '../../services/documentos';
import { DocumentHeader } from '../../components/document-header/document-header';
import { ItemPlanMarco, PlanMarcoFormacion, PlanRotacion as PlanRotacionModel, PracticaSelector } from '../../interfaces';
import { exportarDocumentoWord } from '../../utils/exportar-word';
import { AuthService } from '../../../auth/services/auth.service';

const NUMERO_SEMANAS_MINIMO = 8;

interface EncabezadoPlanRotacion {
  estudianteNombre: string;
  carrera: string;
  nivel: string;
  periodo: string;
  empresaFormadora: string;
  direccionEmpresa: string;
  horasFormacion?: number;
  nucleoEstructurante: string;
  tutorAcademicoNombre: string;
  tutorEmpresarialNombre: string;
}

function encabezadoVacio(): EncabezadoPlanRotacion {
  return {
    estudianteNombre: '',
    carrera: '',
    nivel: '',
    periodo: '',
    empresaFormadora: '',
    direccionEmpresa: '',
    horasFormacion: undefined,
    nucleoEstructurante: '',
    tutorAcademicoNombre: '',
    tutorEmpresarialNombre: ''
  };
}

interface CompetenciasNecesarias {
  conocimientosTeoricos: string;
  procedimentales: string;
  actitudinales: string;
}

function competenciasVacias(): CompetenciasNecesarias {
  return { conocimientosTeoricos: '', procedimentales: '', actitudinales: '' };
}

interface FilaRotacion {
  item: ItemPlanMarco;
  planRotacion: PlanRotacionModel;
  semanasActivas: boolean[];
  semanasGuardadas: Map<number, number>;
}

function filaVacia(item: ItemPlanMarco): FilaRotacion {
  return {
    item,
    planRotacion: {
      id_practica: 0,
      id_item_pm: item.id_item_pm!
    },
    semanasActivas: Array.from({ length: 8 }, () => false),
    semanasGuardadas: new Map<number, number>()
  };
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
  private documentos = inject(Documentos);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  get soloLectura(): boolean {
    return !this.authService.tieneAlgunRol(['ESTUDIANTE']);
  }

  private _practicaId = 0;

  encabezado: EncabezadoPlanRotacion = encabezadoVacio();

  competencias: CompetenciasNecesarias = competenciasVacias();

  filas: FilaRotacion[] = [];

  numeroSemanas = NUMERO_SEMANAS_MINIMO;

  cargando = false;

  guardando = false;

  error: string | null = null;

  ngOnInit(): void {

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this._practicaId = idPracticaRuta;
      this.cargar();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this._practicaId = resp.id_practica;
        this.cargar();
      },
      error: () => {
        Swal.fire('Error', 'No fue posible obtener la práctica.', 'error');
      }
    });

  }

  get columnasSemanas(): number[] {
    return Array.from({ length: this.numeroSemanas }, (_, i) => i + 1);
  }

  private cargar(): void {

    this.cargando = true;
    this.error = null;

    forkJoin({
      practica: this.planFormacion.obtenerPractica(this._practicaId).pipe(catchError(() => of(null as PracticaSelector | null))),
      planesMarco: this.planFormacion.obtenerPlanMarcoPorPractica(this._practicaId).pipe(catchError(() => of([]))),
      datos: this.documentos.obtenerDatosMaestra(this._practicaId).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ practica, planesMarco, datos }) => {

        if (practica) {
          this.encabezado.empresaFormadora = practica.empresa?.razon_social ?? '';
          this.encabezado.direccionEmpresa = practica.empresa?.direccion ?? '';
          this.encabezado.tutorEmpresarialNombre = practica.tutor_empresarial
            ? `${practica.tutor_empresarial.nombres} ${practica.tutor_empresarial.apellidos}`
            : '';
        }

        const datosEstudiante = datos?.['estudiante'] ?? {};
        const datosCarrera = datos?.['carrera'] ?? {};
        const datosPeriodo = datos?.['periodoAcademico'] ?? {};

        this.encabezado.estudianteNombre = datosEstudiante.nombre ?? '';
        this.encabezado.carrera = datosEstudiante.carrera ?? '';
        this.encabezado.nivel = datosEstudiante.nivel ?? '';
        this.encabezado.periodo = datosPeriodo.nombre ?? '';
        this.encabezado.nucleoEstructurante = datosCarrera.nucleoEstructurante ?? '';
        this.encabezado.tutorAcademicoNombre = datosCarrera.tutorAcademico ?? '';

        if (planesMarco.length === 0) {
          this.error = 'Esta práctica todavía no tiene un Plan Marco de Formación. Créalo primero para poder definir el Plan de Rotación.';
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        const planMarco: PlanMarcoFormacion = planesMarco[0];
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

    const filas: FilaRotacion[] = items.map((item) => ({
      item,
      planRotacion: {
        id_practica: this._practicaId,
        id_item_pm: item.id_item_pm!
      },
      semanasActivas: Array.from({ length: 8 }, () => false),
      semanasGuardadas: new Map<number, number>()
    }));

    this.filas = filas;
    this.numeroSemanas = 8;
    this.cargando = false;
    this.cdr.detectChanges();

  }

  toggleSemana(fila: FilaRotacion, semana: number): void {

    if (this.soloLectura) return;

    fila.semanasActivas[semana - 1] = !fila.semanasActivas[semana - 1];

  }

  volver(): void {
    if (this.soloLectura) {
      this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'rotacion' } });
    } else {
      this.router.navigate(['/']);
    }
  }

  descargarWord(): void {
    exportarDocumentoWord('documento-plan-rotacion', 'Plan_Rotacion', 'landscape');
  }

  guardarEnBD(): void {

    if (this.guardando || this.soloLectura || this.filas.length === 0) return;

    this.guardando = true;

    const operaciones = this.filas.map((fila) => this.guardarFila(fila));

    forkJoin(operaciones).subscribe({

      next: () => {

        Swal.fire('Plan de Rotación guardado', 'Las semanas de rotación se guardaron correctamente.', 'success');

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
          id_practica: this._practicaId,
          id_item_pm: fila.item.id_item_pm!,
          puesto_aprendizaje: fila.planRotacion.puesto_aprendizaje
        });

    return asegurarPlanRotacion$.pipe(

      switchMap((planRotacionGuardado) => {

        fila.planRotacion = planRotacionGuardado;
        const idPlanRotacion = planRotacionGuardado.id_plan_rotacion!;

        const semanas: { semana: number; id_item_pm?: number; es_defensa_proyecto?: boolean }[] = [];

        fila.semanasActivas.forEach((activa, idx) => {
          if (activa) {
            const numeroSemana = idx + 1;
            semanas.push({
              semana: numeroSemana,
              id_item_pm: fila.item.id_item_pm,
              es_defensa_proyecto: false
            });
          }
        });

        return this.planFormacion.guardarMatrizSemanas(idPlanRotacion, semanas).pipe(map(() => void 0));

      })

    );

  }

}
