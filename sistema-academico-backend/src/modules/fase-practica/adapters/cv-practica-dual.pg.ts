import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvPracticaDualEntity } from '../domain/cv-practica-dual.entity';
import { CreateCvPracticaDualDto } from '../dto/create-cv-practica-dual.dto';
import { UpdateCvPracticaDualDto } from '../dto/update-cv-practica-dual.dto';
import { CvPracticaDualResponseDto } from '../dto/cv-practica-dual-response.dto';
import { CV_PRACTICA_DUAL_REPOSITORY, ICvPracticaDualRepository } from '../ports/cv-practica-dual.repository.port';

@Injectable()
export class CvPracticaDualPg implements ICvPracticaDualRepository {
  constructor(
    @InjectRepository(CvPracticaDualEntity)
    private readonly repository: Repository<CvPracticaDualEntity>,
  ) {}

  async create(dto: CreateCvPracticaDualDto, idEstudiante: number): Promise<CvPracticaDualResponseDto> {
    const entity = this.repository.create({ ...dto, id_estudiante: idEstudiante });
    const saved = await this.repository.save(entity);
    return saved as unknown as CvPracticaDualResponseDto;
  }

  async findByEstudiante(idEstudiante: number): Promise<CvPracticaDualResponseDto[]> {
    return this.repository.find({ where: { id_estudiante: idEstudiante } }) as Promise<CvPracticaDualResponseDto[]>;
  }

  async findOne(id: number): Promise<CvPracticaDualResponseDto | null> {
    return this.repository.findOne({ where: { id_cv_practica_dual: id } }) as Promise<CvPracticaDualResponseDto | null>;
  }

  async update(id: number, dto: UpdateCvPracticaDualDto): Promise<CvPracticaDualResponseDto> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Practica dual con id ${id} no encontrada`);
    Object.assign(entity, dto);
    return this.repository.save(entity) as Promise<CvPracticaDualResponseDto>;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Practica dual con id ${id} no encontrada`);
    await this.repository.remove(entity as any);
  }
}
