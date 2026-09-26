import { CreateSeguimientoPeaDto } from '../dto/create-seguimiento-pea.dto';
import { SeguimientoPeaResponseDto } from '../dto/seguimiento-pea-response.dto';

export interface ISeguimientoPeaRepository {
  existsByOferta(idOfertaAsignatura: number): Promise<boolean>;
  create(dto: CreateSeguimientoPeaDto, idDocente: number): Promise<SeguimientoPeaResponseDto>;
  findByOferta(idOfertaAsignatura: number, idDocente: number): Promise<SeguimientoPeaResponseDto | null>;
  updateRepresentante(idSeguimientoPea: number, idDocente: number, idRepresentante: number): Promise<void>;
}

export const SEGUIMIENTO_PEA_REPOSITORY = 'SEGUIMIENTO_PEA_REPOSITORY';
