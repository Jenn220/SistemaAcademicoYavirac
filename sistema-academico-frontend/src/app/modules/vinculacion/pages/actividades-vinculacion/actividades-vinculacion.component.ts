import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VinculacionService } from '../../services/vinculacion.service';
import { ActividadEstudiantePayload } from '../../models/proyecto-vinculacion.model';

@Component({
  selector: 'app-actividades-vinculacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ],
  templateUrl: './actividades-vinculacion.component.html',
  styleUrls: ['./actividades-vinculacion.component.scss']
})
export class ActividadesVinculacionComponent implements OnInit {
  actividades: any[] = [];
  proyectos: Array<{ id: number; nombre: string }> = [];
  form: ActividadEstudiantePayload = {
    id_vinculacion: 1,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    horas_total: 0,
    actividades_realizadas: ''
  };
  mensaje = '';
  error = '';

  constructor(private readonly svc: VinculacionService,private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarActividades();
  }

  cargarProyectos(): void {
    this.svc.getProyectos().subscribe({
      next: (data) => {
        this.proyectos = data.map(proyecto => ({ id: proyecto.id, nombre: proyecto.nombre }));
        if (!this.form.id_vinculacion && this.proyectos.length) {
          this.form.id_vinculacion = this.proyectos[0].id;
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los proyectos disponibles.';
        this.cd.detectChanges();
      }
    });
  }

  cargarActividades(): void {
    this.svc.getActividadesEstudiante().subscribe({
      next: (data) => {
        this.actividades = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar actividades.';
        this.cd.detectChanges();
      }
    });
  }

  getProyectoNombre(id?: number): string {
    return this.proyectos.find(proyecto => proyecto.id === id)?.nombre ?? 'Proyecto seleccionado';
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';
    this.svc.createActividad(this.form).subscribe({
      next: () => {
        this.mensaje = 'Actividad registrada correctamente.';
        this.cargarActividades();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo guardar la actividad.';
        this.cd.detectChanges();
      }
    });
  }
}
