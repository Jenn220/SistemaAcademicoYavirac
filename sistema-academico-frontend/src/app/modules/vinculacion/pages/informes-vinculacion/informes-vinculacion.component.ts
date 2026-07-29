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
  }

  cargarProyectos(): void {
  this.svc.getProyectos().subscribe({
    next: (data) => {

      this.proyectos = data.map(proyecto => ({
        id: proyecto.id,
        nombre: proyecto.nombre
      }));

      if (this.proyectos.length > 0) {

        this.form.id_vinculacion = this.proyectos[0].id;

        console.log(
          'ID VINCULACION SELECCIONADO:',
          this.form.id_vinculacion
        );

        this.cargarInformes();
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

  this.svc.getInformes(this.form.id_vinculacion).subscribe({

    next: (response) => {

      console.log('RESPUESTA INFORMES COMPLETA:', response);
      console.log('KEYS:', Object.keys(response));
      console.log('INFORME ACTIVIDADES:', response.informe_actividades);

      this.informes = response.informe_actividades || [];

      console.log('INFORMES FINAL:', this.informes);

      // AGREGA ESTA LÍNEA
      console.log('PRIMER INFORME:', this.informes[0]);
      console.log('PRIMER INFORME JSON:', JSON.stringify(this.informes[0], null, 2));

      this.cd.detectChanges();
    },

    error: (err) => {
      console.error(err);
    }

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
