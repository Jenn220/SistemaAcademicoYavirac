import { CreateInformeFinalDto } from '../dto/create-informe-final.dto';
import { InformeFinalResponseDto } from '../dto/informe-final-response.dto';
import { PortafolioInformeFinal } from '../domain/informe-final.entity';

export interface IInformeFinalRepository {
  findByDocenteAndPeriodo(idDocente: number, idPeriodo: number): Promise<InformeFinalResponseDto | null>;
  create(dto: CreateInformeFinalDto): Promise<PortafolioInformeFinal>;
}

export const INFORME_FINAL_REPOSITORY = 'INFORME_FINAL_REPOSITORY';
