import { OfertaDocenteDto } from '../dto/oferta-docente.dto';

export interface PortafolioRepository {
  findOfertasByDocente(idDocente: number): Promise<OfertaDocenteDto[]>;
}

export const PORTAFOLIO_REPOSITORY = 'PORTAFOLIO_REPOSITORY';
