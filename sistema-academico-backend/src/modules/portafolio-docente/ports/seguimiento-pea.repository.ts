import { CreateSeguimientoPeaDto } from '../dto/create-seguimiento-pea.dto';
import { SeguimientoPeaResponseDto } from '../dto/seguimiento-pea-response.dto';

export interface ISeguimientoPeaRepository {
  existsByOferta(idOfertaAsignatura: number): Promise<boolean>;
  create(dto: CreateSeguimientoPeaDto): Promise<SeguimientoPeaResponseDto>;
  findByOferta(idOfertaAsignatura: number): Promise<SeguimientoPeaResponseDto | null>;
  updateRepresentante(idSeguimientoPea: number, idRepresentante: number): Promise<void>;
}

export const SEGUIMIENTO_PEA_REPOSITORY = 'SEGUIMIENTO_PEA_REPOSITORY';
