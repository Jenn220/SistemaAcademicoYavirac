// modules/vinculacion/pages/compartidas/carta-compromiso/carta-compromiso.component.ts
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
  isDocente = false;
  idVinculacion: number | null = null;

  ngOnInit(): void {
    // Determinar rol y obtener idVinculacion
    this.isDocente = this.authService.roles().includes('DOCENTE');

    this.route.params.subscribe(params => {
      // Si es docente, el id viene en la ruta (docente/estudiante/:id/...)
      // Si es estudiante, el id se resuelve automáticamente, pero podemos pasar 0 o null
      if (this.isDocente && params['id']) {
        this.idVinculacion = +params['id'];
      } else {
        // Estudiante: el backend resuelve con el token, pasamos 0 o no pasamos
        this.idVinculacion = 0; // o null, según el endpoint
      }
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    // Si es estudiante, el backend resuelve el id, así que usamos 0 o simplemente no enviamos
    const id = this.idVinculacion ?? 0;
    this.cartaService.obtenerCartaCompromiso(id)
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