import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CartaCompromisoService } from '../../../services/carta-compromiso.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { CartaCompromiso } from '../../../models/carta-compromiso.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-carta-compromiso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carta-compromiso.html',
  styleUrls: ['./carta-compromiso.scss']
})
export class CartaCompromisoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartaService = inject(CartaCompromisoService);
  private authService = inject(AuthService);

  cartaCompromiso: CartaCompromiso | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  ngOnInit(): void {
    this.isEstudiante = this.authService.roles().includes('ESTUDIANTE');

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
    this.cartaService.obtenerCartaCompromiso(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.cartaCompromiso = data;
        },
        error: (err) => {
          this.error = 'No se pudo cargar la carta de compromiso.';
          console.error(err);
        }
      });
  }
}