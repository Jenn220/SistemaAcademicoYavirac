import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InformeFinalService } from '../../services/informe-final.service';
import { PortafolioService } from '../../services/portafolio.service';
import { AuthService } from '../../../auth/services/auth.service';
import { InformeFinalResponseDto, InformeFinalManualData } from '../../models/informe-final.model';
import { OfertaDocenteDto } from '../../models/oferta-docente.model';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informe-final.component.html',
  styleUrl: './informe-final.component.scss',
})
export class InformeFinalComponent implements OnInit {
  idOfertaAsignatura!: number;

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardandoManual = signal(false);
  readonly mensajeGuardado = signal<string | null>(null);

  readonly informe = signal<InformeFinalResponseDto | null>(null);
  readonly noExisteInforme = signal(false);
  readonly ofertaRelacionada = signal<OfertaDocenteDto | null>(null);

  // Formulario de creación
  horario = '';
  creando = false;
  errorCreacion: string | null = null;

  datosManuales!: InformeFinalManualData;

  readonly fechaHoy = new Date();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly informeFinalService: InformeFinalService,
    private readonly portafolioService: PortafolioService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.idOfertaAsignatura = Number(this.route.snapshot.paramMap.get('idOfertaAsignatura'));
    this.datosManuales = this.informeFinalService.datosManualesVacios();
    this.cargarInforme();
  }

  cargarInforme(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noExisteInforme.set(false);

    this.informeFinalService.getInformeFinal(this.idOfertaAsignatura).subscribe({
      next: (respuesta) => {
        this.informe.set(respuesta);
        this.cargarDatosManuales();
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 404) {
          this.noExisteInforme.set(true);
          this.cargarOfertaRelacionada();
        } else {
          this.error.set('Ocurrió un error al buscar el informe final.');
        }
      },
    });
  }

  private cargarOfertaRelacionada(): void {
    // Necesitamos el id_periodo (no viene en la ruta) y los nombres de
    // asignatura/paralelo para mostrarlos en el formulario de creación.
    this.portafolioService.getMisOfertas().subscribe({
      next: (ofertas) => {
        const oferta = ofertas.find((o) => o.id_oferta_asignatura === this.idOfertaAsignatura);
        this.ofertaRelacionada.set(oferta ?? null);
      },
    });
  }

  private cargarDatosManuales(): void {
    const guardado = this.informeFinalService.obtenerDatosManuales(this.idOfertaAsignatura);
    this.datosManuales = guardado ?? this.informeFinalService.datosManualesVacios();
  }

  crearInforme(): void {
    const oferta = this.ofertaRelacionada();
    const idDocente = this.authService.usuario()?.idDocente;

    if (!oferta || !idDocente) {
      this.errorCreacion = 'No se pudo determinar el docente o la oferta académica.';
      return;
    }
    if (!this.horario.trim()) {
      this.errorCreacion = 'Ingresa el horario.';
      return;
    }

    this.creando = true;
    this.errorCreacion = null;

    this.informeFinalService
      .crearInformeFinal({
        id_docente: idDocente,
        id_periodo: oferta.id_periodo,
        id_asignatura: oferta.id_asignatura,
        id_paralelo: oferta.id_paralelo,
        horario: this.horario.trim(),
      })
      .subscribe({
        next: () => {
          this.creando = false;
          this.cargarInforme();
        },
        error: () => {
          this.creando = false;
          this.errorCreacion =
            'No se pudo crear el informe. Verifica que los IDs de asignatura/paralelo sean correctos.';
        },
      });
  }

  agregarFilaResultado(): void {
    this.datosManuales.resultados = [
      ...this.datosManuales.resultados,
      { cedula: '', nombres: '', asistencia: null, p1: null, p2: null, rc: null },
    ];
  }

  eliminarFilaResultado(index: number): void {
    this.datosManuales.resultados = this.datosManuales.resultados.filter((_, i) => i !== index);
  }

  guardarDatosManuales(): void {
    this.guardandoManual.set(true);
    this.datosManuales.fechaElaboracion = new Date().toISOString();
    this.informeFinalService.guardarDatosManuales(this.idOfertaAsignatura, this.datosManuales);
    this.guardandoManual.set(false);
    this.mensajeGuardado.set('Guardado localmente en este navegador.');
    setTimeout(() => this.mensajeGuardado.set(null), 3000);
  }

  imprimir(): void {
    window.print();
  }
}
