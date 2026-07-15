import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInformeFinalRepository, INFORME_FINAL_REPOSITORY } from '../ports/informe-final.repository';
import { CreateInformeFinalDto } from '../dto/create-informe-final.dto';
import { InformeFinalResponseDto } from '../dto/informe-final-response.dto';
import { PortafolioInformeFinal } from '../domain/informe-final.entity';

@Injectable()
export class InformeFinalService {
  constructor(
    @Inject(INFORME_FINAL_REPOSITORY)
    private readonly informeFinalRepo: IInformeFinalRepository,
  ) {}

  async getInformeFinal(idDocente: number, idPeriodo: number): Promise<InformeFinalResponseDto> {
    const informe = await this.informeFinalRepo.findByDocenteAndPeriodo(idDocente, idPeriodo);
    if (!informe) throw new NotFoundException('Informe final no encontrado para este docente y período');
    return informe;
  }

  async createInformeFinal(dto: CreateInformeFinalDto): Promise<PortafolioInformeFinal> {
    return this.informeFinalRepo.create(dto);
  }
}
