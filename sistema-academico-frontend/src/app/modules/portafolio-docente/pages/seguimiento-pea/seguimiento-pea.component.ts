import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeguimientoPeaService } from '../../services/seguimiento-pea.service';
import { PortafolioService } from '../../services/portafolio.service';
import { WordExportService } from '../../../../shared/services/word-export.service'; // NUEVO
import {
  SeguimientoPeaManualData,
  SeguimientoPeaResponseDto,
} from '../../models/seguimiento-pea.model';
import { EstudianteOfertaDto } from '../../models/estudiante-oferta.model';
import { OfertaDocenteDto } from '../../models/oferta-docente.model';

@Component({
  selector: 'app-seguimiento-pea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seguimiento-pea.component.html',
  styleUrl: './seguimiento-pea.component.scss',
})
export class SeguimientoPeaComponent implements OnInit {
  idOfertaAsignatura!: number;

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardandoManual = signal(false);
  readonly mensajeGuardado = signal<string | null>(null);
  readonly actualizandoRepresentante = signal(false);
  readonly exportandoWord = signal(false); // NUEVO

  readonly seguimiento = signal<SeguimientoPeaResponseDto | null>(null);
  readonly noExisteSeguimiento = signal(false);
  readonly ofertaRelacionada = signal<OfertaDocenteDto | null>(null);
  readonly estudiantes = signal<EstudianteOfertaDto[]>([]);

  representanteSeleccionadoId: number | null = null;
  creando = false;
  errorCreacion: string | null = null;

  editandoRepresentante = false;
  nuevoRepresentanteId: number | null = null;

  manual!: SeguimientoPeaManualData;

  readonly fechaHoy = new Date();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly seguimientoPeaService: SeguimientoPeaService,
    private readonly portafolioService: PortafolioService,
    private readonly wordExportService: WordExportService, // NUEVO
  ) {}

  ngOnInit(): void {
    this.idOfertaAsignatura = Number(this.route.snapshot.paramMap.get('idOfertaAsignatura'));
    this.manual = this.seguimientoPeaService.datosManualesVacios();
    this.cargarEstudiantes();
    this.cargarSeguimiento();
  }

  private cargarEstudiantes(): void {
    this.portafolioService.getEstudiantesDeOferta(this.idOfertaAsignatura).subscribe({
      next: (est) => this.estudiantes.set(est),
      error: () => {
        // No bloquea la vista del seguimiento si esto falla; solo
        // impediría crear/editar el representante.
      },
    });
  }

  cargarSeguimiento(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noExisteSeguimiento.set(false);

    this.seguimientoPeaService.getSeguimientoPea(this.idOfertaAsignatura).subscribe({
      next: (respuesta) => {
        this.seguimiento.set(respuesta);
        this.cargarDatosManuales();
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 404) {
          this.noExisteSeguimiento.set(true);
          this.cargarOfertaRelacionada();
        } else {
          this.error.set('Ocurrió un error al buscar el seguimiento PEA.');
        }
      },
    });
  }

  private cargarOfertaRelacionada(): void {
    this.portafolioService.getMisOfertas().subscribe({
      next: (ofertas) => {
        const oferta = ofertas.find((o) => o.id_oferta_asignatura === this.idOfertaAsignatura);
        this.ofertaRelacionada.set(oferta ?? null);
      },
    });
  }

  private cargarDatosManuales(): void {
    const guardado = this.seguimientoPeaService.obtenerDatosManuales(this.idOfertaAsignatura);
    this.manual = guardado ?? this.seguimientoPeaService.datosManualesVacios();
  }

  crearSeguimiento(): void {
    if (!this.representanteSeleccionadoId) {
      this.errorCreacion = 'Selecciona el representante estudiantil.';
      return;
    }

    this.creando = true;
    this.errorCreacion = null;

    this.seguimientoPeaService
      .crearSeguimientoPea({
        id_oferta_asignatura: this.idOfertaAsignatura,
        id_representante: this.representanteSeleccionadoId,
      })
      .subscribe({
        next: () => {
          this.creando = false;
          this.cargarSeguimiento();
        },
        error: (err) => {
          this.creando = false;
          this.errorCreacion =
            err.status === 409
              ? 'Ya existe un seguimiento PEA generado para esta oferta académica.'
              : 'No se pudo crear el seguimiento PEA.';
        },
      });
  }

  iniciarEdicionRepresentante(): void {
    const actual = this.seguimiento();
    if (!actual) return;
    this.editandoRepresentante = true;
    this.nuevoRepresentanteId = actual.representante.id_estudiante;
  }

  cancelarEdicionRepresentante(): void {
    this.editandoRepresentante = false;
    this.nuevoRepresentanteId = null;
  }

  guardarRepresentante(): void {
    const actual = this.seguimiento();
    if (!actual || !this.nuevoRepresentanteId) return;

    this.actualizandoRepresentante.set(true);
    this.seguimientoPeaService
      .actualizarRepresentante(actual.id_seguimiento_pea, {
        id_representante: this.nuevoRepresentanteId,
      })
      .subscribe({
        next: () => {
          this.actualizandoRepresentante.set(false);
          this.editandoRepresentante = false;
          this.cargarSeguimiento();
        },
        error: () => {
          this.actualizandoRepresentante.set(false);
          this.error.set('No se pudo actualizar el representante. Intenta de nuevo.');
        },
      });
  }

  agregarSemana(): void {
    this.manual.semanas.push({
      semana: this.manual.semanas.length + 1,
      fecha: '',
      temas: '',
      observaciones: '',
    });
  }

  eliminarSemana(index: number): void {
    this.manual.semanas.splice(index, 1);
    this.manual.semanas.forEach((s, i) => (s.semana = i + 1));
  }

  guardarDatosManuales(): void {
    this.guardandoManual.set(true);
    this.seguimientoPeaService.guardarDatosManuales(this.idOfertaAsignatura, this.manual);
    this.guardandoManual.set(false);
    this.mensajeGuardado.set('Guardado localmente en este navegador.');
    setTimeout(() => this.mensajeGuardado.set(null), 3000);
  }

  async exportarWord(): Promise<void> {
    const s = this.seguimiento();
    if (!s) return;

    this.exportandoWord.set(true);
    try {
      await this.wordExportService.exportarSeguimientoPea(s, this.manual);
    } catch {
      this.error.set('No se pudo generar el documento Word. Intenta de nuevo.');
    } finally {
      this.exportandoWord.set(false);
    }
  }
}