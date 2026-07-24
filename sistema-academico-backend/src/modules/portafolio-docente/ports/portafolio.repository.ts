import { OfertaDocenteDto } from '../dto/oferta-docente.dto';
import { EstudianteOfertaDto } from '../dto/estudiante-oferta.dto';

export interface PortafolioRepository {
  findOfertasByDocente(idDocente: number): Promise<OfertaDocenteDto[]>;
  findEstudiantesByOferta(idOfertaAsignatura: number): Promise<EstudianteOfertaDto[]>;
}

export const PORTAFOLIO_REPOSITORY = 'PORTAFOLIO_REPOSITORY';
