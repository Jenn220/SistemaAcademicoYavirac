import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { BITACORA_SEMANAL_REPOSITORY, IBitacoraSemanalRepository } from '../ports/bitacora-semanal.repository.port';

@Injectable()
export class BitacoraSemanalPg implements IBitacoraSemanalRepository {
  constructor(
    @InjectRepository(BitacoraSemanalEntity)
    private readonly bitacoraSemanalRepository: Repository<BitacoraSemanalEntity>,
  ) {}

  async create(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = this.bitacoraSemanalRepository.create(dto);
    return this.bitacoraSemanalRepository.save(bitacora);
  }

  async findByInforme(idInforme: number, skip?: number, take?: number): Promise<BitacoraSemanalEntity[]> {
    return this.bitacoraSemanalRepository.find({ where: { id_informe: idInforme }, skip, take });
  }

  async findById(id: number): Promise<BitacoraSemanalEntity | null> {
    return this.bitacoraSemanalRepository.findOne({ where: { id_bitacora: id } });
  }

  async update(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.findById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    Object.assign(bitacora, dto);
    return this.bitacoraSemanalRepository.save(bitacora);
  }

  async remove(id: number): Promise<void> {
    const bitacora = await this.findById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    await this.bitacoraSemanalRepository.remove(bitacora);
  }
}
