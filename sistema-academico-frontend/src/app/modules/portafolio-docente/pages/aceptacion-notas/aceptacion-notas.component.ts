import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AceptacionNotasService } from '../../services/aceptacion-notas.service';
import {
  CamposLocalesReporte,
  CreateReporteNotasDto,
  ReporteNotasResponseDto,
  TipoReporteAlias,
  TipoReporteCanonico,
} from '../../models/aceptacion-notas.model';

interface OpcionTipoReporte {
  label: string;
  valor: TipoReporteAlias;
  canonico: TipoReporteCanonico;
}

const OPCIONES_TIPO_REPORTE: OpcionTipoReporte[] = [
  { label: 'Parcial Uno', valor: 'PARCIAL UNO', canonico: 'APORTE_1' },
  { label: 'Parcial Dos', valor: 'PARCIAL DOS', canonico: 'APORTE_2' },
  { label: 'Examen Supletorio', valor: 'EXAMEN SUPLETORIO', canonico: 'SUPLETORIO' },
];

@Component({
  selector: 'app-aceptacion-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './aceptacion-notas.component.html',
  styleUrl: './aceptacion-notas.component.scss',
})
export class AceptacionNotasComponent implements OnInit {
  readonly opciones = OPCIONES_TIPO_REPORTE;
  readonly hoy = new Date();

  idOfertaAsignatura!: number;
  idPeriodo!: number;
  tipoSeleccionado: TipoReporteAlias | null = null;

  reporte: ReporteNotasResponseDto | null = null;
  form: FormGroup = this.fb.group({ estudiantes: this.fb.array([]) });
  nombreCoordinador = '';

  cargando = false;
  generando = false;
  guardando = false;
  noExiste = false;
  errorMsg: string | null = null;
  okMsg: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: AceptacionNotasService,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    // Se espera navegar aquí como: /aceptacion-notas/:idOfertaAsignatura/:idPeriodo
    this.idOfertaAsignatura = Number(this.route.snapshot.paramMap.get('idOfertaAsignatura'));
    this.idPeriodo = Number(this.route.snapshot.paramMap.get('idPeriodo'));
  }

  get estudiantesForm(): FormArray {
    return this.form.get('estudiantes') as FormArray;
  }

  seleccionarTipo(op: OpcionTipoReporte): void {
    this.tipoSeleccionado = op.valor;
    this.reporte = null;
    this.noExiste = false;
    this.errorMsg = null;
    this.okMsg = null;
    this.cargarReporte();
  }

  private canonicoActual(): TipoReporteCanonico {
    const opcion = this.opciones.find((o) => o.valor === this.tipoSeleccionado);
    return opcion ? opcion.canonico : 'APORTE_1';
  }

  cargarReporte(): void {
    if (!this.tipoSeleccionado) return;
    this.cargando = true;
    this.errorMsg = null;
    this.noExiste = false;

    this.service.getReporte(this.idOfertaAsignatura, this.canonicoActual()).subscribe({
      next: (resp) => {
        this.pintarReporte(resp);
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        if (err.status === 404) {
          this.noExiste = true;
        } else {
          this.errorMsg = 'No se pudo cargar el reporte desde el servidor.';
        }
      },
    });
  }

  generarReporte(): void {
    if (!this.tipoSeleccionado) return;
    this.generando = true;
    this.errorMsg = null;

    const dto: CreateReporteNotasDto = {
      id_periodo: this.idPeriodo,
      id_oferta_asignatura: this.idOfertaAsignatura,
      tipo_reporte: this.tipoSeleccionado,
    };

    this.service.generarReporte(dto).subscribe({
      next: () => {
        this.generando = false;
        this.cargarReporte();
      },
      error: () => {
        this.generando = false;
        this.errorMsg = 'No se pudo generar el reporte en el servidor.';
      },
    });
  }

  private pintarReporte(resp: ReporteNotasResponseDto): void {
    this.reporte = resp;
    const locales = this.leerCamposLocales(resp.reporte.id_reporte_notas);
    this.nombreCoordinador = locales.nombreCoordinador;

    const grupos = resp.estudiantes.map((est) =>
      this.fb.group({
        id_aceptacion: [est.id_aceptacion],
        cedula: [est.cedula],
        estudiante: [est.estudiante],
        nota: [est.nota_registrada, [Validators.min(0), Validators.max(10)]],
        asistencia: [locales.estudiantes[est.id_aceptacion]?.asistencia ?? null],
        observacion: [locales.estudiantes[est.id_aceptacion]?.observacion ?? ''],
      }),
    );
    this.form.setControl('estudiantes', this.fb.array(grupos));
  }

  guardarNotas(): void {
    if (!this.reporte) return;
    this.guardando = true;
    this.errorMsg = null;
    this.okMsg = null;

    const filas = this.estudiantesForm.value as Array<{ id_aceptacion: number; nota: number }>;
    const dto = {
      estudiantes: filas.map((f) => ({ id_aceptacion: f.id_aceptacion, nota: Number(f.nota) })),
    };

    this.service.actualizarNotas(this.reporte.reporte.id_reporte_notas, dto).subscribe({
      next: () => {
        this.guardando = false;
        this.okMsg = 'Notas guardadas correctamente en el servidor.';
        this.guardarCamposLocales();
      },
      error: () => {
        this.guardando = false;
        this.errorMsg = 'No se pudieron guardar las notas en el servidor.';
      },
    });
  }

  guardarCamposLocalesManual(): void {
    this.guardarCamposLocales();
    this.okMsg = 'Asistencia / observación / coordinador guardados en este navegador.';
  }

  private claveLocal(idReporteNotas: number): string {
    return `aceptacion-notas-local-${idReporteNotas}`;
  }

  private leerCamposLocales(idReporteNotas: number): CamposLocalesReporte {
    const raw = localStorage.getItem(this.claveLocal(idReporteNotas));
    if (!raw) {
      return { nombreCoordinador: '', estudiantes: {} };
    }
    try {
      return JSON.parse(raw) as CamposLocalesReporte;
    } catch {
      return { nombreCoordinador: '', estudiantes: {} };
    }
  }

  private guardarCamposLocales(): void {
    if (!this.reporte) return;
    const filas = this.estudiantesForm.value as Array<{
      id_aceptacion: number;
      asistencia: number | null;
      observacion: string;
    }>;

    const data: CamposLocalesReporte = {
      nombreCoordinador: this.nombreCoordinador,
      estudiantes: {},
    };
    for (const f of filas) {
      data.estudiantes[f.id_aceptacion] = {
        asistencia: f.asistencia,
        observacion: f.observacion,
      };
    }
    localStorage.setItem(
      this.claveLocal(this.reporte.reporte.id_reporte_notas),
      JSON.stringify(data),
    );
  }
}
