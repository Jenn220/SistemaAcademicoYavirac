import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AceptacionNotasService, OPCIONES_TIPO_REPORTE } from '../../services/aceptacion-notas.service';
import { ReporteNotasResponse, EstudianteAceptacionVista, TipoReporteCanonico } from '../../models/aceptacion-notas.model';

@Component({
  selector: 'app-aceptacion-notas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aceptacion-notas.component.html',
  styleUrl: './aceptacion-notas.component.scss',
})
export class AceptacionNotasComponent implements OnInit {
  reporte: ReporteNotasResponse | null = null;
  estudiantes: EstudianteAceptacionVista[] = [];
  error: string | null = null;
  cargando = false;
  guardando = false;
  guardadoOk = false;
  mostrarConfirmacion = false;
  fechaActual = new Date();

  opcionesTipoReporte = OPCIONES_TIPO_REPORTE;
  form: FormGroup;

  constructor(private fb: FormBuilder, private aceptacionNotasService: AceptacionNotasService) {
    this.form = this.fb.group({
      tipoReporte: ['PARCIAL UNO', Validators.required],
    });
  }

  ngOnInit() {
  this.cargarReporte();
}

onTipoReporteChange() {
  this.guardadoOk = false;
  this.cargarReporte();
}

  get labelTipoActual(): string {
    const opcion = this.opcionesTipoReporte.find((o) => o.valorPost === this.form.value.tipoReporte);
    return opcion ? opcion.label : '';
  }

  private canonicoDesdeAlias(alias: string): TipoReporteCanonico {
    const opcion = this.opcionesTipoReporte.find((o) => o.valorPost === alias);
    return opcion ? opcion.canonico : 'APORTE_1';
  }

  cargarReporte() {
    this.cargando = true;
    this.error = null;
    const canonico = this.canonicoDesdeAlias(this.form.value.tipoReporte);

    this.aceptacionNotasService.getReporte(1, canonico).subscribe({
      next: (data) => {
        this.reporte = data;
        this.estudiantes = data.estudiantes as EstudianteAceptacionVista[];
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el reporte: ' + err.message;
        this.cargando = false;
      },
    });
  }

  solicitarGuardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.mostrarConfirmacion = true;
  }

  cancelarGuardar() {
    this.mostrarConfirmacion = false;
  }

  confirmarGuardar() {
    this.mostrarConfirmacion = false;
    this.guardando = true;
    this.guardadoOk = false;

    const dto = {
      id_periodo: 1,
      id_oferta_asignatura: 1,
      tipo_reporte: this.form.value.tipoReporte, // el POST sí acepta el alias tal cual
    };

    this.aceptacionNotasService.generarReporte(dto).subscribe({
      next: () => {
        this.guardando = false;
        this.guardadoOk = true;
      },
      error: (err) => {
        this.guardando = false;
        this.error = 'Error al generar: ' + err.message;
      },
    });
  }
}