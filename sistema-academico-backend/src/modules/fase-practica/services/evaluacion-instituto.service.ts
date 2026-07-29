import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { CreateEvaluacionInstitutoDto } from '../dto/create-evaluacion-instituto.dto';
import { UpdateEvaluacionInstitutoDto } from '../dto/update-evaluacion-instituto.dto';
import { EvaluacionInstitutoResponseDto } from '../dto/evaluacion-instituto-response.dto';

@Injectable()
export class EvaluacionInstitutoService {
  constructor(
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionRepository: Repository<EvaluacionPracticaEntity>,
  ) {}

  async create(dto: CreateEvaluacionInstitutoDto): Promise<EvaluacionInstitutoResponseDto> {
    const evaluacion = this.evaluacionRepository.create({
      id_practica: dto.id_practica,
      id_rubrica: dto.id_evaluacion_plan_marco,
      tipo_evaluador: 'INSTITUTO',
      nota_final_calculada: dto.calificacion,
    });
    const saved = await this.evaluacionRepository.save(evaluacion);

    return {
      id_evaluacion_instituto: saved.id_evaluacion,
      id_practica: saved.id_practica,
      id_evaluacion_plan_marco: saved.id_rubrica,
      calificacion: saved.nota_final_calculada,
    } as EvaluacionInstitutoResponseDto;
  }

  async findByPractica(idPractica: number): Promise<EvaluacionInstitutoResponseDto[]> {
    const evaluaciones = await this.evaluacionRepository.find({
      where: { id_practica: idPractica },
    });

    return evaluaciones.map((e) => ({
      id_evaluacion_instituto: e.id_evaluacion,
      id_practica: e.id_practica,
      id_evaluacion_plan_marco: e.id_rubrica,
      calificacion: e.nota_final_calculada,
    })) as EvaluacionInstitutoResponseDto[];
  }

  async findOne(id: number): Promise<EvaluacionInstitutoResponseDto | null> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: id } });
    if (!evaluacion) return null;

    return {
      id_evaluacion_instituto: evaluacion.id_evaluacion,
      id_practica: evaluacion.id_practica,
      id_evaluacion_plan_marco: evaluacion.id_rubrica,
      calificacion: evaluacion.nota_final_calculada,
    } as EvaluacionInstitutoResponseDto;
  }

  async update(id: number, dto: UpdateEvaluacionInstitutoDto): Promise<EvaluacionInstitutoResponseDto> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: id } });
    if (!evaluacion) throw new NotFoundException(`Evaluacion con id ${id} no encontrada`);

    Object.assign(evaluacion, {
      nota_final_calculada: dto.calificacion,
    });

    const saved = await this.evaluacionRepository.save(evaluacion);

    return {
      id_evaluacion_instituto: saved.id_evaluacion,
      id_practica: saved.id_practica,
      id_evaluacion_plan_marco: saved.id_rubrica,
      calificacion: saved.nota_final_calculada,
    } as EvaluacionInstitutoResponseDto;
  }

  async remove(id: number): Promise<void> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: id } });
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    await this.evaluacionRepository.remove(evaluacion);
  }
}
