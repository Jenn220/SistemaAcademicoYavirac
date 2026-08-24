import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';
import { EVALUACION_PRACTICA_REPOSITORY, IEvaluacionPracticaRepository } from '../ports/evaluacion-practica.repository.port';

@Injectable()
export class EvaluacionPracticaPg implements IEvaluacionPracticaRepository {
  constructor(
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionPracticaRepository: Repository<EvaluacionPracticaEntity>,
  ) {}

  async create(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = this.evaluacionPracticaRepository.create(dto);
    return this.evaluacionPracticaRepository.save(evaluacion);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<EvaluacionPracticaEntity[]> {
    return this.evaluacionPracticaRepository.find({ where: { id_practica: idPractica }, skip, take });
  }

  async findById(id: number): Promise<EvaluacionPracticaEntity | null> {
    return this.evaluacionPracticaRepository.findOne({ where: { id_evaluacion: id } });
  }

  async update(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    Object.assign(evaluacion, dto);
    return this.evaluacionPracticaRepository.save(evaluacion);
  }

  async remove(id: number): Promise<void> {
    const evaluacion = await this.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    await this.evaluacionPracticaRepository.remove(evaluacion);
  }
}
