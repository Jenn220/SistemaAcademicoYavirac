import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VinculacionService } from '../../services/vinculacion.service';
import { InformePayload } from '../../models/proyecto-vinculacion.model';

@Component({
  selector: 'app-informes-vinculacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,],
  templateUrl: './informes-vinculacion.component.html',
  styleUrls: ['./informes-vinculacion.component.scss']
})
export class InformesVinculacionComponent implements OnInit {
  informes: any[] = [];
  proyectos: Array<{ id: number; nombre: string }> = [];
  form: InformePayload = {
    id_vinculacion: 1,
    fecha_informe: '',
    actividad_macro: '',
    resultado_aprendizaje: ''
  };
  mensaje = '';
  error = '';

  constructor(private readonly svc: VinculacionService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarInformes();
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

  cargarInformes(): void {
    this.svc.getInformes().subscribe({
      next: (data) => { this.informes = data; this.cd.detectChanges(); },
      error: () => { this.error = 'No se pudieron cargar informes.'; this.cd.detectChanges(); }
    });
  }

  getProyectoNombre(id?: number): string {
    return this.proyectos.find(proyecto => proyecto.id === id)?.nombre ?? 'Proyecto seleccionado';
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';
    this.svc.createInforme(this.form).subscribe({
      next: () => {
        this.mensaje = 'Informe registrado correctamente.';
        this.cargarInformes();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo guardar el informe.';
        this.cd.detectChanges();
      }
    });
  }
}
