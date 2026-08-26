import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { RUBRICA_REPOSITORY, IRubricaRepository } from '../ports/rubrica.repository.port';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';
import { RubricaEntity } from '../domain/rubrica.entity';

@Injectable()
export class RubricaService {
  constructor(
    @Inject(RUBRICA_REPOSITORY)
    private readonly rubricaRepository: IRubricaRepository,
  ) {}

  async create(dto: CreateRubricaDto): Promise<RubricaEntity> {
    return this.rubricaRepository.create(dto);
  }

  async findAll(skip?: number, take?: number): Promise<RubricaEntity[]> {
    return this.rubricaRepository.findAll(skip, take);
  }

  async findById(id: number): Promise<RubricaEntity> {
    const rubrica = await this.rubricaRepository.findById(id);
    if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    return rubrica;
  }

  async update(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity> {
    await this.findById(id);
    return this.rubricaRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    return this.rubricaRepository.remove(id);
  }
}
