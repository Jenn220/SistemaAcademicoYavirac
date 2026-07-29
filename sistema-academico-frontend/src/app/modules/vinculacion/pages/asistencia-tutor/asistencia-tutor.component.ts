import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VinculacionService } from '../../services/vinculacion.service';
import { AsistenciaTutorPayload } from '../../models/proyecto-vinculacion.model';

@Component({
  selector: 'app-asistencia-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './asistencia-tutor.component.html',
  styleUrls: ['./asistencia-tutor.component.scss']
})
export class AsistenciaTutorComponent implements OnInit {

  asistencias: any[] = [];

  form: AsistenciaTutorPayload = {
    id_vinculacion: 1,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    horas_total: 0,
    observaciones: ''
  };

  mensaje = '';
  error = '';

  constructor(
    private readonly svc: VinculacionService,
    private readonly cd: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.cargarAsistencias();
  }


  cargarAsistencias(): void {

    this.svc.getAsistenciasTutor().subscribe({

      next: (data) => {

        // Solo mostramos asistencias del proyecto seleccionado
        this.asistencias = data.filter(
          item => item.id_vinculacion === this.form.id_vinculacion
        );

        this.cd.detectChanges();
      },


      error: () => {

        this.error = 'No se pudieron cargar las asistencias registradas.';
        this.cd.detectChanges();

      }

    });

  }



  guardar(): void {

    this.mensaje = '';
    this.error = '';

    this.svc.createAsistenciaTutor(this.form).subscribe({

      next: () => {

        this.mensaje = 'Asistencia registrada correctamente.';

        const idActual = this.form.id_vinculacion;


        this.form = {

          id_vinculacion: idActual,
          fecha: '',
          hora_inicio: '',
          hora_fin: '',
          horas_total: 0,
          observaciones: ''

        };


        this.cargarAsistencias();

      },


      error: (err) => {

        this.error =
          err?.error?.message ||
          'No se pudo guardar la asistencia.';

        this.cd.detectChanges();

      }

    });

  }



}