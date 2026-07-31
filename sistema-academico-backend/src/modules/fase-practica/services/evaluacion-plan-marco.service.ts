import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVALUACION_PLAN_MARCO_REPOSITORY, IEvaluacionPlanMarcoRepository } from '../ports/evaluacion-plan-marco.repository.port';
import { CreateEvaluacionPlanMarcoDto } from '../dto/create-evaluacion-plan-marco.dto';
import { UpdateEvaluacionPlanMarcoDto } from '../dto/update-evaluacion-plan-marco.dto';

@Injectable()
export class EvaluacionPlanMarcoService {
  constructor(
    @Inject(EVALUACION_PLAN_MARCO_REPOSITORY)
    private readonly repository: IEvaluacionPlanMarcoRepository,
  ) {}

  /** Crea, o actualiza si ya existe una evaluación para ese ítem (evita duplicados por resultado de aprendizaje). */
  async crearOActualizar(dto: CreateEvaluacionPlanMarcoDto) {
    const existente = await this.repository.findByItemPlanMarco(dto.id_item_pm);
    if (existente) {
      return this.repository.update(existente.id_evaluacion_pm, { nivel_real_alcanzado: dto.nivel_real_alcanzado });
    }
    return this.repository.create(dto);
  }

  async findByPractica(idPractica: number) {
    return this.repository.findByPractica(idPractica);
  }

  async findById(id: number) {
    const entidad = await this.repository.findById(id);
    if (!entidad) throw new NotFoundException(`No se encontró la evaluación de plan marco con id ${id}`);
    return entidad;
  }

  async update(id: number, dto: UpdateEvaluacionPlanMarcoDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.repository.remove(id);
    return { deleted: true, id_evaluacion_pm: id };
  }
}
