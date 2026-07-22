import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VinculacionService } from '../../services/vinculacion.service';
import { ProyectoVinculacion } from '../../models/proyecto-vinculacion.model';

@Component({
  selector: 'app-detalle-vinculacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './detalle-vinculacion.component.html',
  styleUrls: ['./detalle-vinculacion.component.scss']
})
export class DetalleVinculacionComponent implements OnInit {

  proyecto?: ProyectoVinculacion;
  exportando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: VinculacionService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = Number(params.get('id'));

      console.log('ID DETALLE:', id);

      if (!id || isNaN(id)) {
        this.router.navigate(['/vinculacion']);
        return;
      }

      this.cargarProyecto(id);

    });

  }


  private cargarProyecto(id: number): void {

    this.svc.getProyectoById(id).subscribe({

      next: (p) => {

        console.log('PROYECTO DETALLE:', p);

        if (!p) {
          this.router.navigate(['/vinculacion']);
          return;
        }

        this.proyecto = {
          ...p
        };

        console.log(
          'VARIABLE DESPUÉS DE ASIGNAR:',
          this.proyecto
        );

        this.cd.detectChanges();

      },

      error: (err) => {
        console.error(
          'ERROR CARGANDO DETALLE:',
          err
        );
      }

    });

  }

  descargarExcel(): void {
    if (!this.proyecto?.id) {
      return;
    }

    this.exportando = true;
    try {
      this.svc.exportarReporteExcel(this.proyecto.id, this.proyecto);
    } finally {
      this.cd.detectChanges();
      this.exportando = false;
    }
  }

  descargarActa(): void {
    if (!this.proyecto?.id) return;
    this.svc.exportarActaCompromisoExcel(this.proyecto.id);
  }

  descargarCertificado(): void {
    if (!this.proyecto?.id) return;
    this.svc.exportarCertificadoExcel(this.proyecto.id);
  }

  descargarInicioTutor(): void {
    if (!this.proyecto?.id) return;
    this.svc.exportarInicioTutorExcel(this.proyecto.id);
  }

  descargarInformeActividades(): void {
    if (!this.proyecto?.id) return;
    this.svc.exportarInformeActividadesExcel(this.proyecto.id);
  }

  descargarInformeFinal(): void {
    if (!this.proyecto) return;
    const proyecto = this.proyecto;
    this.svc.exportarInformeFinalExcel(proyecto);
  }

}