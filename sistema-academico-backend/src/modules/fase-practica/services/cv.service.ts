import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CV_DATO_ACADEMICO_REPOSITORY, ICvDatoAcademicoRepository } from '../ports/cv-dato-academico.repository.port';
import { CV_EXPERIENCIA_LABORAL_REPOSITORY, ICvExperienciaLaboralRepository } from '../ports/cv-experiencia-laboral.repository.port';
import { CV_PRACTICA_DUAL_REPOSITORY, ICvPracticaDualRepository } from '../ports/cv-practica-dual.repository.port';
import { CreateCvDatoAcademicoDto } from '../dto/create-cv-dato-academico.dto';
import { UpdateCvDatoAcademicoDto } from '../dto/update-cv-dato-academico.dto';
import { CreateCvExperienciaLaboralDto } from '../dto/create-cv-experiencia-laboral.dto';
import { UpdateCvExperienciaLaboralDto } from '../dto/update-cv-experiencia-laboral.dto';
import { CreateCvPracticaDualDto } from '../dto/create-cv-practica-dual.dto';
import { UpdateCvPracticaDualDto } from '../dto/update-cv-practica-dual.dto';

@Injectable()
export class CvService {
  constructor(
    @Inject(CV_DATO_ACADEMICO_REPOSITORY) private readonly datoAcademicoRepo: ICvDatoAcademicoRepository,
    @Inject(CV_EXPERIENCIA_LABORAL_REPOSITORY) private readonly experienciaRepo: ICvExperienciaLaboralRepository,
    @Inject(CV_PRACTICA_DUAL_REPOSITORY) private readonly practicaDualRepo: ICvPracticaDualRepository,
  ) {}

  async createDatoAcademico(idEstudiante: number, dto: CreateCvDatoAcademicoDto) {
    return this.datoAcademicoRepo.create(dto, idEstudiante);
  }

  async findDatosAcademicos(idEstudiante: number) {
    return this.datoAcademicoRepo.findByEstudiante(idEstudiante);
  }

  async updateDatoAcademico(id: number, dto: UpdateCvDatoAcademicoDto) {
    return this.datoAcademicoRepo.update(id, dto);
  }

  async removeDatoAcademico(id: number) {
    await this.datoAcademicoRepo.remove(id);
  }

  async createExperienciaLaboral(idEstudiante: number, dto: CreateCvExperienciaLaboralDto) {
    return this.experienciaRepo.create(dto, idEstudiante);
  }

  async findExperienciasLaborales(idEstudiante: number) {
    return this.experienciaRepo.findByEstudiante(idEstudiante);
  }

  async updateExperienciaLaboral(id: number, dto: UpdateCvExperienciaLaboralDto) {
    return this.experienciaRepo.update(id, dto);
  }

  async removeExperienciaLaboral(id: number) {
    await this.experienciaRepo.remove(id);
  }

  async createPracticaDual(idEstudiante: number, dto: CreateCvPracticaDualDto) {
    return this.practicaDualRepo.create(dto, idEstudiante);
  }

  async findPracticasDuales(idEstudiante: number) {
    return this.practicaDualRepo.findByEstudiante(idEstudiante);
  }

  async updatePracticaDual(id: number, dto: UpdateCvPracticaDualDto) {
    return this.practicaDualRepo.update(id, dto);
  }

  async removePracticaDual(id: number) {
    await this.practicaDualRepo.remove(id);
  }
}
