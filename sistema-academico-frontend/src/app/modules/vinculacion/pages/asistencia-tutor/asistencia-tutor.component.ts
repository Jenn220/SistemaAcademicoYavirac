import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutShellComponent } from '../../../../shared/components/layout/layout.component';
import { VinculacionService } from '../../services/vinculacion.service';
import { AsistenciaTutorPayload } from '../../models/proyecto-vinculacion.model';

@Component({
  selector: 'app-asistencia-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LayoutShellComponent],
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

  constructor(private readonly svc: VinculacionService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.svc.getAsistenciasTutor().subscribe({
      next: (data) => { this.asistencias = data; this.cd.detectChanges(); },
      error: () => { this.error = 'No se pudieron cargar asistencias.'; this.cd.detectChanges(); }
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';
    this.svc.createAsistenciaTutor(this.form).subscribe({
      next: () => {
        this.mensaje = 'Asistencia registrada correctamente.';
        this.ngOnInit();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo guardar la asistencia.';this.cd.detectChanges();
      }
    });
  }
}
