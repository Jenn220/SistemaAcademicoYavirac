import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { PlanFormacion } from '../../services/plan-formacion';
import { Documentos } from '../../services/documentos';
import { AuthService } from '../../../auth/services/auth.service';
import { DocumentHeader } from '../../components/document-header/document-header';
import { PlanMarcoFormacion, ItemPlanMarco, PracticaSelector } from '../../interfaces';
import { exportarDocumentoWord } from '../../utils/exportar-word';

// Niveles de logro esperado: definiciones institucionales fijas
// (idénticas para toda práctica), tal como aparecen en el Formato 03.
const NIVELES_LOGRO_ESPERADO = [
  {
    nivel: 1,
    titulo: 'CONOCIMIENTOS BÁSICOS',
    descripcion: 'El estudiante de la carrera dual debe familiarizarse con los contenidos y relaciones del área, de tal forma que pueda nombrarlos y diferenciarlos.'
  },
  {
    nivel: 2,
    titulo: 'CONOCIMIENTOS',
    descripcion: 'El estudiante de la carrera dual se debe formar en las competencias del área hasta el punto que las pueda aclarar y pueda dar información sobre las mismas.'
  },
  {
    nivel: 3,
    titulo: 'PARTICIPACIÓN EN LOS PROCEDIMIENTOS',
    descripcion: 'El estudiante de la carrera dual debe adquirir las suficientes capacidades prácticas de tal forma que pueda realizar las tareas o pueda preparar su ejecución.'
  },
  {
    nivel: 4,
    titulo: 'VALORACIÓN O ELABORACIÓN PROPIA DE PROCEDIMIENTOS DE TRABAJO',
    descripcion: 'El estudiante de la carrera dual se debe formar en la aplicación práctica de tal forma que pueda realizar o elaborar las tareas sin indicaciones y además pueda evaluar una tarea de acuerdo a su criterio.'
  }
];

interface EncabezadoPlanMarco {
  estudianteNombre: string;
  periodo: string;
  carrera: string;
  nivel: string;
  empresaFormadora: string;
  direccionEmpresa: string;
  nucleoEstructuranteNombre: string;
  tutorEmpresarialNombre: string;
  tutorAcademicoNombre: string;
}

function encabezadoVacio(): EncabezadoPlanMarco {
  return {
    estudianteNombre: '',
    periodo: '',
    carrera: '',
    nivel: '',
    empresaFormadora: '',
    direccionEmpresa: '',
    nucleoEstructuranteNombre: '',
    tutorEmpresarialNombre: '',
    tutorAcademicoNombre: ''
  };
}

@Component({
  selector: 'app-plan-marco',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './plan-marco.html',
  styleUrl: './plan-marco.scss'
})
export class PlanMarco implements OnInit {

  private planFormacion = inject(PlanFormacion);
  private documentos = inject(Documentos);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  niveles = NIVELES_LOGRO_ESPERADO;

  idPractica = 0;

  // Datos que el back no resuelve para una práctica ajena al usuario
  // logueado (ver comentario en plan-formacion.interface.ts): se llenan
  // a mano, igual que en el Excel original.
  encabezado: EncabezadoPlanMarco = encabezadoVacio();

  plan: PlanMarcoFormacion = { id_practica: 0 };

  items: ItemPlanMarco[] = [];

  cargando = false;

  guardando = false;

  get esEstudiante(): boolean {
    return this.authService.tieneAlgunRol(['ESTUDIANTE']);
  }

  ngOnInit(): void {

    this.idPractica = Number(this.route.snapshot.paramMap.get('idPractica'));
    this.plan = { id_practica: this.idPractica };

    this.cargar();

  }

  private cargar(): void {

    this.cargando = true;

    forkJoin({
      practica: this.planFormacion.obtenerPractica(this.idPractica).pipe(catchError(() => of(null as PracticaSelector | null))),
      planes: this.planFormacion.obtenerPlanMarcoPorPractica(this.idPractica).pipe(catchError(() => of([] as PlanMarcoFormacion[])))
    }).subscribe({

      next: ({ practica, planes, datos }: { practica: PracticaSelector | null; planes: PlanMarcoFormacion[]; datos: Record<string, any> }) => {

        const datosEstudiante = datos?.['estudiante'] ?? {};
        const datosCarrera = datos?.['carrera'] ?? {};
        const datosPeriodo = datos?.['periodoAcademico'] ?? {};
        const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

        if (practica) {
          this.encabezado.empresaFormadora = practica.empresa?.razon_social ?? '';
          this.encabezado.direccionEmpresa = practica.empresa?.direccion ?? '';
          this.encabezado.tutorEmpresarialNombre = practica.tutor_empresarial
            ? `${practica.tutor_empresarial.nombres} ${practica.tutor_empresarial.apellidos}`
            : '';
        }

        if (planes.length > 0) {
          this.plan = planes[0];
          this.cargarItems(this.plan.id_plan_marco!);
        } else {
          this.plan = { id_practica: this.idPractica };
          this.items = [];
          this.cargando = false;
          this.cdr.detectChanges();
        }

      },

      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }

    });

  }

  private cargarItems(idPlanMarco: number): void {

    this.planFormacion.listarItemsPlanMarco(idPlanMarco).subscribe({

      next: (items) => {
        this.items = items;
        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.items = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }

    });

  }

  agregarFila(): void {

    this.items.push({
      id_plan_marco: this.plan.id_plan_marco,
      resultado_aprendizaje: '',
      nivel_logro_esperado: 3,
      tareas_laborales: '',
      puesto_aprendizaje: '',
      semanas: undefined,
      responsable_puesto: ''
    });

  }

  eliminarFila(item: ItemPlanMarco): void {

    const index = this.items.indexOf(item);
    if (index === -1) return;

    if (!item.id_item_pm) {
      this.items.splice(index, 1);
      return;
    }

    this.planFormacion.eliminarItemPlanMarco(item.id_item_pm).subscribe({

      next: () => {
        this.items.splice(index, 1);
        this.cdr.detectChanges();
      },

      error: () => Swal.fire('Error', 'No fue posible eliminar la fila.', 'error')

    });

  }

  seleccionarNivelEsperado(item: ItemPlanMarco, nivel: number): void {
    item.nivel_logro_esperado = nivel;
  }

  get promedioNivelEsperado(): string {

    if (this.items.length === 0) return '—';

    const suma = this.items.reduce((acc, i) => acc + (Number(i.nivel_logro_esperado) || 0), 0);

    return (suma / this.items.length).toFixed(2);

  }

  /**
   * A diferencia del nivel esperado, "nivel real alcanzado" no tiene
   * backend todavía (ver comentario en ItemPlanMarco), así que casi
   * siempre va a mostrar "—": es honesto, no se inventa un promedio con
   * datos que no existen en la BD.
   */
  get promedioNivelReal(): string {

    const valores = this.items
      .map((i) => i.nivel_real_alcanzado)
      .filter((v): v is number => v !== undefined && v !== null && !isNaN(Number(v)));

    if (valores.length === 0) return '—';

    const suma = valores.reduce((acc, v) => acc + Number(v), 0);

    return (suma / valores.length).toFixed(2);

  }

  volver(): void {
    this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'marco' } });
  }

  descargarWord(): void {
    exportarDocumentoWord('documento-plan-marco', 'Plan_Marco_Formacion', 'landscape');
  }

  guardarEnBD(): void {

    if (this.guardando) return;

    if (this.items.length === 0) {
      Swal.fire('Sin resultados de aprendizaje', 'Agrega al menos un resultado de aprendizaje antes de guardar.', 'warning');
      return;
    }

    this.guardando = true;

    const datosPlan: Partial<PlanMarcoFormacion> = {
      id_practica: this.idPractica,
      horas_formacion: this.plan.horas_formacion,
      objetivos_fase_practica: this.plan.objetivos_fase_practica,
      id_nucleo_estructurante: this.plan.id_nucleo_estructurante
    };

    const guardarPlan$ = this.plan.id_plan_marco
      ? this.planFormacion.actualizarPlanMarco(this.plan.id_plan_marco, datosPlan)
      : this.planFormacion.crearPlanMarco(datosPlan);

    guardarPlan$.subscribe({

      next: (planGuardado) => {
        this.plan = planGuardado;
        this.guardarItems(planGuardado.id_plan_marco!);
      },

      error: () => {
        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar el Plan Marco.', 'error');
      }

    });

  }

  private guardarItems(idPlanMarco: number): void {

    // nivel_real_alcanzado no se envía: el back todavía no expone
    // evaluacion_plan_marco (ver ItemPlanMarco en plan-formacion.interface.ts).
    const operaciones = this.items.map((item) => {

      const dto = {
        resultado_aprendizaje: item.resultado_aprendizaje,
        nivel_logro_esperado: item.nivel_logro_esperado,
        tareas_laborales: item.tareas_laborales,
        puesto_aprendizaje: item.puesto_aprendizaje,
        semanas: item.semanas,
        responsable_puesto: item.responsable_puesto
      };

      return item.id_item_pm
        ? this.planFormacion.actualizarItemPlanMarco(item.id_item_pm, dto)
        : this.planFormacion.crearItemPlanMarco(idPlanMarco, dto);

    });

    forkJoin(operaciones).subscribe({

      next: (itemsGuardados) => {

        this.items = itemsGuardados.map((guardado, i) => ({
          ...guardado,
          nivel_real_alcanzado: this.items[i].nivel_real_alcanzado
        }));

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire('Plan Marco guardado', 'Los resultados de aprendizaje se guardaron correctamente.', 'success');

      },

      error: () => {
        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'El Plan Marco se guardó, pero hubo un problema guardando los resultados de aprendizaje.', 'error');
      }

    });

  }

}
