import { Injectable, Inject } from '@nestjs/common';
import { PortafolioRepository, PORTAFOLIO_REPOSITORY } from '../ports/portafolio.repository';
import { OfertaDocenteDto } from '../dto/oferta-docente.dto';
import { EstudianteOfertaDto } from '../dto/estudiante-oferta.dto';

@Injectable()
export class PortafolioService {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolioRepo: PortafolioRepository,
  ) {}

  getMisOfertas(idDocente: number): Promise<OfertaDocenteDto[]> {
    return this.portafolioRepo.findOfertasByDocente(idDocente);
  }

  getEstudiantesDeOferta(idOfertaAsignatura: number): Promise<EstudianteOfertaDto[]> {
    return this.portafolioRepo.findEstudiantesByOferta(idOfertaAsignatura);
  }
}
