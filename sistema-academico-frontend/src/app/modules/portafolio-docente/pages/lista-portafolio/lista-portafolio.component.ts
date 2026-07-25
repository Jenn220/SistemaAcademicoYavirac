import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PortafolioService } from '../../services/portafolio.service';
import { OfertaDocenteDto } from '../../models/oferta-docente.model';

@Component({
  selector: 'app-lista-portafolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-portafolio.component.html',
  styleUrl: './lista-portafolio.component.scss',
})
export class ListaPortafolioComponent implements OnInit {
  ofertas: OfertaDocenteDto[] = [];
  cargando = false;
  errorMsg: string | null = null;

  constructor(
    private readonly service: PortafolioService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.cargando = true;
    this.errorMsg = null;

    this.service.getMisOfertas().subscribe({
      next: (resp) => {
        this.ofertas = resp;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.errorMsg =
          err.status === 404
            ? 'No tienes ofertas académicas asignadas todavía.'
            : 'No se pudieron cargar tus ofertas desde el servidor.';
      },
    });
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
