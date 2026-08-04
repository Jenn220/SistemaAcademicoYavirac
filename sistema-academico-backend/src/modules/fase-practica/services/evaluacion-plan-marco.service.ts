import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EVALUACION_PLAN_MARCO_REPOSITORY, IEvaluacionPlanMarcoRepository } from '../ports/evaluacion-plan-marco.repository.port';
import { CreateEvaluacionPlanMarcoDto } from '../dto/create-evaluacion-plan-marco.dto';
import { UpdateEvaluacionPlanMarcoDto } from '../dto/update-evaluacion-plan-marco.dto';

@Injectable()
export class EvaluacionPlanMarcoService {
  constructor(
    @Inject(EVALUACION_PLAN_MARCO_REPOSITORY)
    private readonly repository: IEvaluacionPlanMarcoRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async esDuenoDePractica(usuario: any, idPractica: number): Promise<void> {
    if (usuario.rol !== 'ESTUDIANTE') {
      return;
    }
    const esDueno = await this.dataSource.query(
      `SELECT 1 FROM matricula_detalle md
       JOIN matricula m ON m.id_matricula = md.id_matricula
       JOIN practica_estudiante pe ON pe.id_matricula_detalle = md.id_matricula_detalle
       WHERE pe.id_practica = $1 AND m.id_estudiante = $2`,
      [idPractica, usuario.id_usuario],
    );
    if (!esDueno || esDueno.length === 0) {
      throw new NotFoundException('No tienes permiso para modificar esta evaluación de plan marco');
    }
  }

  async crearOActualizar(usuario: any, dto: CreateEvaluacionPlanMarcoDto) {
    await this.esDuenoDePractica(usuario, dto.id_practica);
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

  async update(usuario: any, id: number, dto: UpdateEvaluacionPlanMarcoDto) {
    const entidad = await this.repository.findById(id);
    if (!entidad) throw new NotFoundException(`No se encontró la evaluación de plan marco con id ${id}`);
    await this.esDuenoDePractica(usuario, entidad.id_practica);
    return this.repository.update(id, dto);
  }

  async remove(usuario: any, id: number) {
    const entidad = await this.repository.findById(id);
    if (!entidad) throw new NotFoundException(`No se encontró la evaluación de plan marco con id ${id}`);
    await this.esDuenoDePractica(usuario, entidad.id_practica);
    await this.repository.remove(id);
    return { deleted: true, id_evaluacion_pm: id };
  }
}
