import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BITACORA_SEMANAL_REPOSITORY, IBitacoraSemanalRepository } from '../ports/bitacora-semanal.repository.port';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';

@Injectable()
export class BitacoraSemanalService {
  constructor(
    @Inject(BITACORA_SEMANAL_REPOSITORY)
    private readonly bitacoraSemanalRepository: IBitacoraSemanalRepository,
  ) {}

  async create(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
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
    await this.findById(id);
    return this.bitacoraSemanalRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    return this.bitacoraSemanalRepository.remove(id);
  }
}
