import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortafolioService } from '../../services/portafolio.service';
import { OfertaDocenteDto } from '../../models/oferta-docente.model';

type ModoPortafolio = 'informe-final' | 'aceptacion-notas' | null;

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

  // Si vienes del sidebar con ?modo=informe-final o ?modo=aceptacion-notas,
  // esta pantalla actúa como si fuera la de destino (título y botón único),
  // manteniendo igual el paso obligatorio de elegir la materia (los IDs
  // solo se conocen después de elegir).
  //
  // OJO: se lee de forma REACTIVA (toSignal sobre queryParamMap), no con
  // route.snapshot. Como el sidebar navega dentro de la MISMA ruta
  // ('/portafolio-docente') y solo cambia el query param, Angular reutiliza
  // la instancia del componente y NO vuelve a llamar a ngOnInit. Si se leía
  // el modo solo una vez en ngOnInit (snapshot), al cambiar de pestaña
  // quedaba "pegado" el modo anterior hasta refrescar manualmente.
  private readonly modoParam = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly modo = computed<ModoPortafolio>(() => {
    const valor = this.modoParam().get('modo');
    return valor === 'informe-final' || valor === 'aceptacion-notas' ? valor : null;
  });

  readonly titulo = computed(() => {
    switch (this.modo()) {
      case 'informe-final':
        return 'Informe Final';
      case 'aceptacion-notas':
        return 'Aceptación de Notas';
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

  /** Al elegir materia: si venías con un modo fijo, va directo a esa pantalla. */
  seleccionarOferta(oferta: OfertaDocenteDto): void {
    if (this.modo() === 'informe-final') {
      this.irAInformeFinal(oferta);
    } else if (this.modo() === 'aceptacion-notas') {
      this.irAAceptacionNotas(oferta);
    }
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
