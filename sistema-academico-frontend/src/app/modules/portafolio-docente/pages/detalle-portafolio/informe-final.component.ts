// src/app/modules/portafolio-docente/pages/detalle-portafolio/informe-final.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InformeFinalService } from '../../services/informe-final.service';
import { PortafolioService } from '../../services/portafolio.service';
import { AuthService } from '../../../auth/services/auth.service';
import { WordExportService } from '../../../../shared/services/word-export.service';
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
  readonly exportandoWord = signal(false);
  readonly esSoloLectura = signal(false);

  readonly informe = signal<InformeFinalResponseDto | null>(null);
  readonly noExisteInforme = signal(false);
  readonly ofertaRelacionada = signal<OfertaDocenteDto | null>(null);

  // Formulario / Edición de Horario
  editandoHorario = false;
  horario = '';
  creando = false;
  errorCreacion: string | null = null;

  datosManuales!: InformeFinalManualData;

  readonly fechaHoy = new Date();

  // 🔑 Flag para evitar bloqueo inmediato tras crear el informe
  private informeRecienCreado = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly informeFinalService: InformeFinalService,
    private readonly portafolioService: PortafolioService,
    private readonly authService: AuthService,
    private readonly wordExportService: WordExportService,
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
    this.editandoHorario = false;
    this.esSoloLectura.set(false);

    this.informeFinalService.getInformeFinal(this.idOfertaAsignatura).subscribe({
      next: (respuesta) => {
        this.informe.set(respuesta);
        this.cargarDatosManuales();
        this.cargando.set(false);
        this.cargarOfertaRelacionada();
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
    this.portafolioService.getMisOfertas().subscribe({
      next: (ofertas) => {
        const oferta = ofertas.find((o) => o.id_oferta_asignatura === this.idOfertaAsignatura);
        this.ofertaRelacionada.set(oferta ?? null);

        if (oferta && this.informe() !== null) {
          if (this.informeRecienCreado) {
            this.esSoloLectura.set(false);
            this.informeRecienCreado = false;
          } else {
            this.esSoloLectura.set(!!oferta.tiene_informe_final);
          }
        } else {
          this.esSoloLectura.set(false);
        }
      },
      error: () => {
        this.esSoloLectura.set(false);
      },
    });
  }

  private cargarDatosManuales(): void {
    const guardado = this.informeFinalService.obtenerDatosManuales(this.idOfertaAsignatura);
    this.datosManuales = guardado ?? this.informeFinalService.datosManualesVacios();
  }

  modoEditarHorario(): void {
    if (this.esSoloLectura()) return;
    const inf = this.informe();
    if (inf) {
      this.horario = inf.informe.horario;
    }
    this.errorCreacion = null;
    this.editandoHorario = true;
    if (!this.ofertaRelacionada()) {
      this.cargarOfertaRelacionada();
    }
  }

  cancelarEdicion(): void {
    this.editandoHorario = false;
    this.errorCreacion = null;
  }

  guardarHorario(): void {
    if (this.esSoloLectura()) return;

    if (!this.horario.trim()) {
      this.errorCreacion = 'Ingresa el horario.';
      return;
    }

    const inf = this.informe();
    this.creando = true;
    this.errorCreacion = null;

    // Si ya existe el informe, actualizamos horario
    if (inf) {
      const rawInf = inf as any;
      const rawInner = (inf.informe as any) || {};

      const idInformeFinal =
        rawInner.id_informe_final ||
        rawInner.id_informe ||
        rawInner.id ||
        rawInf.id_informe_final ||
        rawInf.id_informe ||
        rawInf.id;

      if (!idInformeFinal) {
        this.creando = false;
        this.errorCreacion = 'No se encontró el ID numérico del informe final.';
        console.warn('Estructura completa recibida de informe:', inf);
        return;
      }

      this.informeFinalService.actualizarHorario(idInformeFinal, this.horario.trim()).subscribe({
        next: () => {
          this.creando = false;
          this.editandoHorario = false;
          // ✅ Actualizamos el horario en el objeto local sin recargar todo
          const current = this.informe();
          if (current) {
            (current.informe as any).horario = this.horario.trim();
            // Forzamos la señal a actualizarse (clonando el objeto)
            this.informe.set({ ...current });
          }
          this.horario = '';
          // No llamamos a cargarInforme() para no recargar y evitar bloqueo
        },
        error: (err) => {
          console.error('Error al actualizar horario:', err);
          this.creando = false;
          this.errorCreacion = 'No se pudo actualizar el horario en la base de datos.';
        },
      });
      return;
    }

    // Si no existe, se crea vía POST
    const oferta = this.ofertaRelacionada();
    const idDocente = this.authService.usuario()?.idDocente;

    if (!oferta || !idDocente) {
      this.errorCreacion = 'No se pudo determinar el docente o la oferta académica.';
      this.creando = false;
      return;
    }

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
          this.informeRecienCreado = true;
          this.cargarInforme(); // tras crear sí recargamos para obtener el ID
        },
        error: () => {
          this.creando = false;
          this.errorCreacion = 'No se pudo crear el informe. Verifica los datos.';
        },
      });
  }

  guardarDatosManuales(): void {
    if (this.esSoloLectura()) return;
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

  async exportarWord(): Promise<void> {
    const inf = this.informe();
    if (!inf) return;

    this.exportandoWord.set(true);
    try {
      await this.wordExportService.exportarInformeFinal(inf, this.datosManuales);
    } catch {
      this.error.set('No se pudo generar el documento Word. Intenta de nuevo.');
    } finally {
      this.exportandoWord.set(false);
    }
  }
}