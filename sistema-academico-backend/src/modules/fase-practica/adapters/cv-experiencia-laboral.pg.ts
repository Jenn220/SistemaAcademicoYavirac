import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvExperienciaLaboralEntity } from '../domain/cv-experiencia-laboral.entity';
import { CreateCvExperienciaLaboralDto } from '../dto/create-cv-experiencia-laboral.dto';
import { UpdateCvExperienciaLaboralDto } from '../dto/update-cv-experiencia-laboral.dto';
import { CvExperienciaLaboralResponseDto } from '../dto/cv-experiencia-laboral-response.dto';
import { CV_EXPERIENCIA_LABORAL_REPOSITORY, ICvExperienciaLaboralRepository } from '../ports/cv-experiencia-laboral.repository.port';

@Injectable()
export class CvExperienciaLaboralPg implements ICvExperienciaLaboralRepository {
  constructor(
    @InjectRepository(CvExperienciaLaboralEntity)
    private readonly repository: Repository<CvExperienciaLaboralEntity>,
  ) {}

  async create(dto: CreateCvExperienciaLaboralDto, idEstudiante: number): Promise<CvExperienciaLaboralResponseDto> {
    const entity = this.repository.create({ ...dto, id_estudiante: idEstudiante });
    const saved = await this.repository.save(entity);
    return saved as unknown as CvExperienciaLaboralResponseDto;
  }

  async findByEstudiante(idEstudiante: number): Promise<CvExperienciaLaboralResponseDto[]> {
    return this.repository.find({ where: { id_estudiante: idEstudiante } }) as Promise<CvExperienciaLaboralResponseDto[]>;
  }

  async findOne(id: number): Promise<CvExperienciaLaboralResponseDto | null> {
    return this.repository.findOne({ where: { id_cv_experiencia_laboral: id } }) as Promise<CvExperienciaLaboralResponseDto | null>;
  }

  async update(id: number, dto: UpdateCvExperienciaLaboralDto): Promise<CvExperienciaLaboralResponseDto> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Registro laboral con id ${id} no encontrado`);
    Object.assign(entity, dto);
    return this.repository.save(entity) as Promise<CvExperienciaLaboralResponseDto>;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Registro laboral con id ${id} no encontrado`);
    await this.repository.remove(entity as any);
  }
}
