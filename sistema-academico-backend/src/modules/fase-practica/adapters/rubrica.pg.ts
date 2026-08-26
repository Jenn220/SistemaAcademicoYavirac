import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricaEntity } from '../domain/rubrica.entity';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';
import { RUBRICA_REPOSITORY, IRubricaRepository } from '../ports/rubrica.repository.port';

@Injectable()
export class RubricaPg implements IRubricaRepository {
  constructor(
    @InjectRepository(RubricaEntity)
    private readonly rubricaRepository: Repository<RubricaEntity>,
  ) {}

  async create(dto: CreateRubricaDto): Promise<RubricaEntity> {
    const rubrica = this.rubricaRepository.create(dto);
    return this.rubricaRepository.save(rubrica);
  }

  async findAll(skip?: number, take?: number): Promise<RubricaEntity[]> {
    return this.rubricaRepository.find({ skip, take });
  }

  async findById(id: number): Promise<RubricaEntity | null> {
    return this.rubricaRepository.findOne({ where: { id_rubrica: id } });
  }

  async update(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity> {
    const rubrica = await this.findById(id);
    if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    Object.assign(rubrica, dto);
    return this.rubricaRepository.save(rubrica);
  }

  async remove(id: number): Promise<void> {
    const rubrica = await this.findById(id);
    if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    await this.rubricaRepository.remove(rubrica);
  }
}
