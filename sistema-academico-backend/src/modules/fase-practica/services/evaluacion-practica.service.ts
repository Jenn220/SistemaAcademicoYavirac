import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EVALUACION_PRACTICA_REPOSITORY, IEvaluacionPracticaRepository } from '../ports/evaluacion-practica.repository.port';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';

@Injectable()
export class EvaluacionPracticaService {
  constructor(
    @Inject(EVALUACION_PRACTICA_REPOSITORY)
    private readonly evaluacionPracticaRepository: IEvaluacionPracticaRepository,
  ) {}

  async create(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    if (dto.nota_final_calculada !== undefined && (dto.nota_final_calculada < 0 || dto.nota_final_calculada > 10)) {
      throw new BadRequestException('La nota final calculada debe estar entre 0 y 10');
    }
    return this.evaluacionPracticaRepository.create(dto);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<EvaluacionPracticaEntity[]> {
    return this.evaluacionPracticaRepository.findByPractica(idPractica, skip, take);
  }

  async findById(id: number): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    return evaluacion;
  }

  async update(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    if (dto.nota_final_calculada !== undefined && (dto.nota_final_calculada < 0 || dto.nota_final_calculada > 10)) {
      throw new BadRequestException('La nota final calculada debe estar entre 0 y 10');
    }
    await this.findById(id);
    return this.evaluacionPracticaRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    return this.evaluacionPracticaRepository.remove(id);
  }
}
