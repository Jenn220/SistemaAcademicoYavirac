import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CartaCompromisoService } from '../../../services/carta-compromiso.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { CartaCompromiso } from '../../../models/carta-compromiso.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-carta-compromiso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carta-compromiso.component.html',
  styleUrls: ['./carta-compromiso.component.scss']
})
export class CartaCompromisoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartaService = inject(CartaCompromisoService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);

  cartaCompromiso: CartaCompromiso | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  idVinculacion: number = 0;

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
      this.loading = false;
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else {
        // ✅ Si no viene ID en la URL, obtener vinculación activa del estudiante
        this.obtenerVinculacionActiva();
      }
    });
  }

  /**
   * ✅ Obtener vinculación activa del estudiante autenticado
   */
  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();
          } else {
            this.error = 'No se encontró una vinculación activa para este estudiante.';
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    console.log('🔵 Cargando Carta Compromiso para vinculación:', this.idVinculacion);
    
    this.cartaService.obtenerCartaCompromiso(this.idVinculacion)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de Carta Compromiso recibidos:', data);
          this.cartaCompromiso = data;
        },
        error: (err) => {
          console.error('❌ Error al cargar Carta Compromiso:', err);
          this.error = 'No se pudo cargar la carta de compromiso.';
        }
      });
  }
}