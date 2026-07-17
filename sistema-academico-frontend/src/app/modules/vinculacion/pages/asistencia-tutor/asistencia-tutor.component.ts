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



  descargarExcel(): void {
   console.log('ENTRO A DESCARGAR EXCEL');
    const idVinculacion = this.form.id_vinculacion;


    if (!idVinculacion) {

      this.error = 'Ingrese un ID de vinculación válido.';
      return;

    }


    this.mensaje =
      'Generando reporte Formato 07 (Tutor)...';

    this.error = '';



    this.svc.getAsistenciasTutor().subscribe({

      next: (data) => {


        const asistenciasFiltradas =
          data.filter(
            item => item.id_vinculacion === idVinculacion
          );



        const proyecto:any = {


          // Datos que no existen en la tabla actual
          carrera: 'N/A',

          entidad_beneficiaria: 'N/A',

          docente_tutor: 'Tutor Vinculación',

          periodo_academico: 'N/A',



          // Datos reales de asistencia
          actividades: asistenciasFiltradas.map(item => ({

            fecha: item.fecha,

            hora_entrada: item.hora_inicio,

            hora_salida: item.hora_fin,

            total_horas: Number(item.horas_total),

            actividad_realizada:
              item.observaciones ?? ''

          })),


          total_horas:
            asistenciasFiltradas.reduce(
              (total,item)=>
              total + Number(item.horas_total),
              0
            ),


          observaciones:''
        };



        this.svc.exportarFormato07Excel(
          idVinculacion,
          proyecto
        );


        this.mensaje =
          'Reporte Formato 07 descargado correctamente.';

        this.cd.detectChanges();


      },


      error:()=>{

        this.error =
        'Error al cargar asistencias para el reporte.';

        this.mensaje='';

        this.cd.detectChanges();

      }


    });

  }


}