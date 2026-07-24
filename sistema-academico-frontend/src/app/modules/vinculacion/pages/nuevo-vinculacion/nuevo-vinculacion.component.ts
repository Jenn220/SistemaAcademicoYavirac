import { Component ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VinculacionService } from '../../services/vinculacion.service';
import { CrearProyectoVinculacionPayload } from '../../models/proyecto-vinculacion.model';

@Component({
  selector: 'app-nuevo-vinculacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nuevo-vinculacion.component.html',
  styleUrls: ['./nuevo-vinculacion.component.scss']
})
export class NuevoVinculacionComponent {
  periodos = [
    { id: 1, nombre: 'Periodo 2025 - 1' },
    { id: 2, nombre: 'Periodo 2025 - 2' },
    { id: 3, nombre: 'Periodo 2026 - 1' }
  ];
  matriculas = [
    { id: 1, nombre: 'Matrícula 001 - Estudiante Demo' },
    { id: 2, nombre: 'Matrícula 002 - Estudiante Demo 2' }
  ];
  empresas = [
    { id: 1, nombre: 'Empresa Demo Yavirac' },
    { id: 2, nombre: 'Fundación Comunitaria' }
  ];
  docentes = [
    { id: 1, nombre: 'Docente Demo' },
    { id: 2, nombre: 'Docente Coordinador' }
  ];
  estados = ['ACTIVO', 'EN CURSO', 'FINALIZADO'];

  model: CrearProyectoVinculacionPayload = {
    id_periodo: 1,
    id_matricula_detalle: 1,
    id_empresa: 1,
    id_docente: 1,
    nombre_proyecto: '',
    fecha_inicio: '',
    fecha_fin: '',
    total_horas_estudiante: 0,
    total_horas_docente: 0,
    estado: 'ACTIVO'
  };

  isSubmitting = false;
  mensaje = '';
  error = '';

  constructor(private readonly svc: VinculacionService,private cd: ChangeDetectorRef) {}

  guardarProyecto(): void {
    this.isSubmitting = true;
    this.mensaje = '';
    this.error = '';
    this.cd.detectChanges();

    this.svc.createProyecto(this.model).subscribe({
      next: () => {
        this.mensaje = 'Proyecto registrado correctamente.';
        this.isSubmitting = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo guardar el proyecto.';
        this.isSubmitting = false;
        this.cd.detectChanges();
      }
    });
  }
}
