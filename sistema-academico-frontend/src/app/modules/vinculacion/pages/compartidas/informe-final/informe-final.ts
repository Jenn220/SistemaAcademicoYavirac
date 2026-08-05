import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InformeFinalService } from '../../../services/informe-final.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { InformeFinal } from '../../../models/informe-final.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informe-final.html',
  styleUrls: ['./informe-final.scss']
})
export class InformeFinalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InformeFinalService);
  private authService = inject(AuthService);

  data: InformeFinal | null = null;
  loading = true;
  error: string | null = null;
  isDocente = false;
  idVinculacion: number = 0;

  ngOnInit(): void {
    this.isDocente = this.authService.roles().includes('DOCENTE');

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idVinculacion = +params['id'];
      } else {
        this.idVinculacion = 0;
      }
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.service.obtenerInforme(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.data = data;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el informe final.';
          console.error(err);
        }
      });
  }
}