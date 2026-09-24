import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CartaCompromisoService } from '../../../services/carta-compromiso.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { CartaCompromiso } from '../../../models/carta-compromiso.model';
import { finalize } from 'rxjs/operators';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';
import { ExcelExportService } from '../../../services/excel-export.service';

@Component({
  selector: 'app-carta-compromiso',
  standalone: true,
  imports: [CommonModule, VolverArchivosComponent],
  templateUrl: './carta-compromiso.component.html',
  styleUrls: ['./carta-compromiso.component.scss']
})
export class CartaCompromisoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartaService = inject(CartaCompromisoService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);
  private excelService = inject(ExcelExportService);

  cartaCompromiso: CartaCompromiso | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  isDocente = false;
  idVinculacion: number = 0;

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');

    if (!this.isEstudiante && !this.isDocente) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else {
        this.obtenerVinculacionActiva();
      }
    });
  }

  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();
          } else {
            this.error = 'No se encontró una vinculación activa para este estudiante.';
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
          this.cdr.markForCheck();
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    console.log('🔵 Cargando Carta Compromiso para vinculación:', this.idVinculacion);
    
    this.cartaService.obtenerCartaCompromiso(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de Carta Compromiso recibidos:', data);
          this.cartaCompromiso = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Carta Compromiso:', err);
          this.error = 'No se pudo cargar la carta de compromiso.';
          this.cdr.markForCheck();
        }
      });
  }

  // ✅ Exportar a Excel
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.cartaCompromiso) {
      alert('No hay datos para exportar.');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'C.C.',
        this.cartaCompromiso
      );
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel.');
    }
  }
}