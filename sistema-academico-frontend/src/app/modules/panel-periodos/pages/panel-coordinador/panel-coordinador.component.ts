import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodoCarrera, ResumenCierrePeriodo } from '../../models/periodo-carrera.model';
import { CierrePeriodoService } from '../../services/cierre-periodo.service';
import { ESTADOS_PERIODO_CARRERA } from '../../models/estados.constants';

@Component({
  selector: 'app-panel-coordinador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-coordinador.component.html',
  styleUrls: ['./panel-coordinador.component.scss'],
})
export class PanelCoordinadorComponent implements OnInit {
  periodos: PeriodoCarrera[] = [];
  resumen: ResumenCierrePeriodo | null = null;
  periodoSeleccionado: PeriodoCarrera | null = null;
  mostrarConfirmacion = false;
  cerrando = false;
  mensaje = '';

  // TODO: reemplazar por el id del coordinador autenticado (leer de auth.service.ts)
  private idCoordinadorActual = 1;

  readonly ESTADOS = ESTADOS_PERIODO_CARRERA;

  constructor(private cierrePeriodoService: CierrePeriodoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.cierrePeriodoService
      .obtenerPeriodosDelCoordinador(this.idCoordinadorActual)
      .subscribe({
        next: (periodos) => { this.periodos = periodos; this.cdr.detectChanges(); },
        error: (err) => console.error('ERROR AL CARGAR PERIODOS:', err)
      });
  }

  verResumen(periodo: PeriodoCarrera): void {
    this.periodoSeleccionado = periodo;
    this.resumen = null;
    this.cierrePeriodoService
      .obtenerResumenCierre(periodo.idPeriodoCarrera)
      .subscribe((r) => (this.resumen = r));
  }

  pedirConfirmacion(): void {
    this.mostrarConfirmacion = true;
  }

  cancelarCierre(): void {
    this.mostrarConfirmacion = false;
  }

  confirmarCierre(): void {
    if (!this.periodoSeleccionado) return;
    this.cerrando = true;
    this.cierrePeriodoService
      .cerrarPeriodo(this.periodoSeleccionado.idPeriodoCarrera)
      .subscribe((res) => {
        this.cerrando = false;
        this.mostrarConfirmacion = false;
        this.mensaje = res.mensaje;
        if (this.periodoSeleccionado) {
          this.periodoSeleccionado.estado = this.ESTADOS.FINALIZADO;
        }
      });
  }

  puedeCerrar(periodo: PeriodoCarrera): boolean {
    return periodo.idCoordinador === this.idCoordinadorActual && periodo.estado === this.ESTADOS.ACTIVO;
  }
}
