import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';

export const EVALUACION_PRACTICA_REPOSITORY = 'EvaluacionPracticaRepository';

export interface IEvaluacionPracticaRepository {
  create(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity>;
  findByPractica(idPractica: number, skip?: number, take?: number): Promise<EvaluacionPracticaEntity[]>;
  findById(id: number): Promise<EvaluacionPracticaEntity | null>;
  update(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity>;
  remove(id: number): Promise<void>;
}
