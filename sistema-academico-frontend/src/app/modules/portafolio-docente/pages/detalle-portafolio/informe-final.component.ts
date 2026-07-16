import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InformeFinalService, MOCK_ASIGNATURAS, MOCK_PARALELOS, MOCK_ESTUDIANTES } from '../../services/informe-final.service';
import { InformeFinalResponse } from '../../models/informe-final.model';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './informe-final.component.html',
  styleUrl: './informe-final.component.scss',
})
export class InformeFinalComponent implements OnInit {
  informe: InformeFinalResponse | null = null;
  error: string | null = null;
  guardando = false;
  guardadoOk = false;
  mostrarConfirmacion = false;

  fechaActual = new Date();

  asignaturas = MOCK_ASIGNATURAS;
  paralelos = MOCK_PARALELOS;
  estudiantes = MOCK_ESTUDIANTES;

  form: FormGroup;

  constructor(private fb: FormBuilder, private informeFinalService: InformeFinalService) {
    this.form = this.fb.group({
      idAsignatura: [1, Validators.required],
      idParalelo: [1, Validators.required],
      horario: ['', Validators.required],
      antecedentes: ['Con el fin de realizar una evaluación del proceso docente del periodo que termina, se realiza el presente informe, el mismo que tiene por objetivo garantizar la calidad académica en el INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC y dotar de insumos para ser analizados para procurar una mejora constante en el desarrollo formativo que mantiene la institución', Validators.required],
      desarrolloActividades: ['', Validators.required],
      infraestructuraResultado: ['', Validators.required],
      infraestructuraRecomendacion: [''],
      planEstudiosResultado: ['', Validators.required],
      planEstudiosRecomendacion: [''],
      recomendacionesFinales: [''],
    });
  }

  ngOnInit() {
    this.informeFinalService.getInformeFinal(1, 1).subscribe({
      next: (data) => {
        this.informe = data;
        this.form.patchValue({ horario: data.informe.horario });
      },
      error: (err) => (this.error = 'No se pudo cargar el informe: ' + err.message),
    });
  }

  // --- Cálculos de las tablas de resumen (sección 5 del PDF), derivados de `estudiantes` ---
  get totalEstudiantes(): number {
    return this.estudiantes.length;
  }

  get resumenEquivalencia() {
    const rangos = [
      { label: 'EXCELENTE', min: 9.5, max: 10 },
      { label: 'MUY BUENO', min: 8.5, max: 9.49 },
      { label: 'BUENO', min: 7.0, max: 8.49 },
      { label: 'REGULAR', min: 4.0, max: 6.99 },
      { label: 'DEFICIENTE', min: 0, max: 3.99 },
    ];
    return rangos.map((r) => {
      const count = this.estudiantes.filter((e) => e.nf >= r.min && e.nf <= r.max).length;
      return { ...r, frecuencia: count, porcentaje: this.totalEstudiantes ? (count / this.totalEstudiantes) * 100 : 0 };
    });
  }

  get resumenPromocion() {
    const estados = ['PROMOVIDO', 'NO PROMOVIDO', 'NO PROMOVIDO POR FALTAS'];
    return estados.map((label) => {
      const count = this.estudiantes.filter((e) => e.promocion === label).length;
      return { label, frecuencia: count, porcentaje: this.totalEstudiantes ? (count / this.totalEstudiantes) * 100 : 0 };
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
      id_docente: 1,
      id_periodo: 1,
      id_asignatura: Number(this.form.value.idAsignatura),
      id_paralelo: Number(this.form.value.idParalelo), 
      horario: this.form.value.horario,
    };

    this.informeFinalService.createInformeFinal(dto).subscribe({
      next: () => {
        this.guardando = false;
        this.guardadoOk = true;
      },
      error: (err) => {
        this.guardando = false;
        this.error = 'Error al guardar: ' + err.message;
      },
    });
  }
}