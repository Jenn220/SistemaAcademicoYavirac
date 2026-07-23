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
    this.svc.getActividadesEstudiante().subscribe({
      next: (data) => { this.actividades = data,
       this.cd.detectChanges()
       },
      error: () =>{ this.error = 'No se pudieron cargar actividades.',
        this.cd.detectChanges();
       }      
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';
    this.svc.createActividad(this.form).subscribe({
      next: () => {
        this.mensaje = 'Actividad registrada correctamente.';
        this.ngOnInit();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo guardar la actividad.';
        this.cd.detectChanges();
      }
    });
  }
}
