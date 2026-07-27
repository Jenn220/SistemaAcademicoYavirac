import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvDatoAcademicoEntity } from '../domain/cv-dato-academico.entity';
import { CreateCvDatoAcademicoDto } from '../dto/create-cv-dato-academico.dto';
import { UpdateCvDatoAcademicoDto } from '../dto/update-cv-dato-academico.dto';
import { CvDatoAcademicoResponseDto } from '../dto/cv-dato-academico-response.dto';
import { CV_DATO_ACADEMICO_REPOSITORY, ICvDatoAcademicoRepository } from '../ports/cv-dato-academico.repository.port';

@Injectable()
export class CvDatoAcademicoPg implements ICvDatoAcademicoRepository {
  constructor(
    @InjectRepository(CvDatoAcademicoEntity)
    private readonly repository: Repository<CvDatoAcademicoEntity>,
  ) {}

  async create(dto: CreateCvDatoAcademicoDto, idEstudiante: number): Promise<CvDatoAcademicoResponseDto> {
    const entity = this.repository.create({ ...dto, id_estudiante: idEstudiante });
    const saved = await this.repository.save(entity);
    return saved as unknown as CvDatoAcademicoResponseDto;
  }

  async findByEstudiante(idEstudiante: number): Promise<CvDatoAcademicoResponseDto[]> {
    return this.repository.find({ where: { id_estudiante: idEstudiante } }) as Promise<CvDatoAcademicoResponseDto[]>;
  }

  async findOne(id: number): Promise<CvDatoAcademicoResponseDto | null> {
    return this.repository.findOne({ where: { id_cv_dato_academico: id } }) as Promise<CvDatoAcademicoResponseDto | null>;
  }

  async update(id: number, dto: UpdateCvDatoAcademicoDto): Promise<CvDatoAcademicoResponseDto> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Registro academico con id ${id} no encontrado`);
    Object.assign(entity, dto);
    return this.repository.save(entity) as Promise<CvDatoAcademicoResponseDto>;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Registro academico con id ${id} no encontrado`);
    await this.repository.remove(entity as any);
  }
}
