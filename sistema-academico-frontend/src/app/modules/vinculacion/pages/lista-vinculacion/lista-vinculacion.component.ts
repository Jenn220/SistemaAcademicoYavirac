import { Component, OnInit,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutShellComponent } from '../../../../shared/components/layout/layout.component';
import { VinculacionService } from '../../services/vinculacion.service';
import { ProyectoVinculacion } from '../../models/proyecto-vinculacion.model';


@Component({
  selector: 'app-lista-vinculacion',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutShellComponent],
  templateUrl: './lista-vinculacion.component.html',
  styleUrls: ['./lista-vinculacion.component.scss']
})
export class ListaVinculacionComponent implements OnInit {
  proyectos: ProyectoVinculacion[] = [];
  resumen = {
    proyectosActivos: 0,
    estudiantesVinculados: 0,
    impactoSocial: 92,
    evaluacionesPendientes: 18
  };

  constructor(private svc: VinculacionService ,private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.svc.getProyectos().subscribe(p => {
      this.proyectos = p;
      this.resumen.proyectosActivos = p.filter(item => item.estado?.toLowerCase() === 'activo').length;
      this.resumen.estudiantesVinculados = p.reduce((sum, item) => sum + Number(item.estudiantes ?? 0), 0);
        this.cd.detectChanges();
    });
     
  }
}
