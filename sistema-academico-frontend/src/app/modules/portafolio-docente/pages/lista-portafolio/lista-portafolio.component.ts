import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortafolioService } from '../../services/portafolio.service';
import { OfertaDocenteDto } from '../../models/oferta-docente.model';

type ModoPortafolio = 'informe-final' | 'aceptacion-notas' | 'seguimiento-pea' | null;

@Component({
  selector: 'app-lista-portafolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-portafolio.component.html',
  styleUrl: './lista-portafolio.component.scss',
})
export class ListaPortafolioComponent implements OnInit {
  readonly ofertas = signal<OfertaDocenteDto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  private readonly modoParam = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly modo = computed<ModoPortafolio>(() => {
    const valor = this.modoParam().get('modo');
    return valor === 'informe-final' || valor === 'aceptacion-notas' || valor === 'seguimiento-pea'
      ? valor
      : null;
  });

  readonly titulo = computed(() => {
    switch (this.modo()) {
      case 'informe-final':
        return 'Informe Final';
      case 'aceptacion-notas':
        return 'Aceptación de Notas';
      case 'seguimiento-pea':
        return 'Seguimiento PEA';
      default:
        return 'Mi Portafolio Docente';
    }
  });

  readonly subtitulo = computed(() => {
    if (this.modo()) {
      return 'Selecciona la materia para continuar.';
    }
    return 'Selecciona una materia para gestionar su Informe Final o Aceptación de Notas.';
  });

  // Filtros para clasificar materias por el estado del informe
  readonly ofertasPendientes = computed(() => {
    return this.ofertas().filter((o) => !o.tiene_informe_final);
  });

  readonly ofertasGeneradas = computed(() => {
    return this.ofertas().filter((o) => !!o.tiene_informe_final);
  });

  // Filtros para clasificar materias por el estado de Seguimiento PEA
readonly ofertasPeaPendientes = computed(() => {
  return this.ofertas().filter((o) => !o.tiene_seguimiento_pea);
});

readonly ofertasPeaGeneradas = computed(() => {
  return this.ofertas().filter((o) => !!o.tiene_seguimiento_pea);
});

  constructor(
    private readonly portafolioService: PortafolioService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.portafolioService.getMisOfertas().subscribe({
      next: (ofertas) => {
        this.ofertas.set(ofertas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus materias asignadas. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  seleccionarOferta(oferta: OfertaDocenteDto): void {
    if (this.modo() === 'informe-final') {
      this.irAInformeFinal(oferta);
    } else if (this.modo() === 'aceptacion-notas') {
      this.irAAceptacionNotas(oferta);
    } else if (this.modo() === 'seguimiento-pea') {
      this.irASeguimientoPea(oferta);
    }
  }

  irASeguimientoPea(oferta: OfertaDocenteDto): void {
    this.router.navigate(['/portafolio-docente/seguimiento-pea', oferta.id_oferta_asignatura]);
  }

  irAInformeFinal(oferta: OfertaDocenteDto): void {
    this.router.navigate(['/portafolio-docente/informe-final', oferta.id_oferta_asignatura]);
  }

  irAAceptacionNotas(oferta: OfertaDocenteDto): void {
    this.router.navigate([
      '/portafolio-docente/aceptacion-notas',
      oferta.id_oferta_asignatura,
      oferta.id_periodo,
    ]);
  }
}