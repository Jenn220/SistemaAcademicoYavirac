import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BITACORA_SEMANAL_REPOSITORY, IBitacoraSemanalRepository } from '../ports/bitacora-semanal.repository.port';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { INFORME_APRENDIZAJE_REPOSITORY, IInformeAprendizajeRepository } from '../ports/informe-aprendizaje.repository.port';
import { PeriodoContextService } from './periodo-context.service';

@Injectable()
export class BitacoraSemanalService {
  constructor(
    @Inject(BITACORA_SEMANAL_REPOSITORY)
    private readonly bitacoraSemanalRepository: IBitacoraSemanalRepository,
    @Inject(INFORME_APRENDIZAJE_REPOSITORY)
    private readonly informeAprendizajeRepository: IInformeAprendizajeRepository,
    private readonly periodoContextService: PeriodoContextService,
  ) {}

  async create(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const informe = await this.informeAprendizajeRepository.findById(dto.id_informe);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${dto.id_informe}`);
    }
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.bitacoraSemanalRepository.create(dto);
  }

  async findByInforme(idInforme: number, skip?: number, take?: number): Promise<BitacoraSemanalEntity[]> {
    return this.bitacoraSemanalRepository.findByInforme(idInforme, skip, take);
  }

  async findById(id: number): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.bitacoraSemanalRepository.findById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    return bitacora;
  }

  async update(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.findById(id);
    const informe = await this.informeAprendizajeRepository.findById(bitacora.id_informe);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${bitacora.id_informe}`);
    }
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.bitacoraSemanalRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    const bitacora = await this.findById(id);
    const informe = await this.informeAprendizajeRepository.findById(bitacora.id_informe);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${bitacora.id_informe}`);
    }
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.bitacoraSemanalRepository.remove(id);
  }
}
