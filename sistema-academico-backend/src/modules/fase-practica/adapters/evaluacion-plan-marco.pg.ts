import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionPlanMarcoEntity } from '../domain/evaluacion-plan-marco.entity';
import { CreateEvaluacionPlanMarcoDto } from '../dto/create-evaluacion-plan-marco.dto';
import { UpdateEvaluacionPlanMarcoDto } from '../dto/update-evaluacion-plan-marco.dto';
import { IEvaluacionPlanMarcoRepository } from '../ports/evaluacion-plan-marco.repository.port';

@Injectable()
export class EvaluacionPlanMarcoPg implements IEvaluacionPlanMarcoRepository {
  constructor(
    @InjectRepository(EvaluacionPlanMarcoEntity)
    private readonly repository: Repository<EvaluacionPlanMarcoEntity>,
  ) {}

  async create(dto: CreateEvaluacionPlanMarcoDto): Promise<EvaluacionPlanMarcoEntity> {
    const entidad = this.repository.create(dto);
    return this.repository.save(entidad);
  }

  async findByPractica(idPractica: number): Promise<EvaluacionPlanMarcoEntity[]> {
    return this.repository.find({ where: { id_practica: idPractica } });
  }

  async findById(id: number): Promise<EvaluacionPlanMarcoEntity | null> {
    return this.repository.findOne({ where: { id_evaluacion_pm: id } });
  }

  async findByItemPlanMarco(idItemPm: number): Promise<EvaluacionPlanMarcoEntity | null> {
    return this.repository.findOne({ where: { id_item_pm: idItemPm } });
  }

  async update(id: number, dto: UpdateEvaluacionPlanMarcoDto): Promise<EvaluacionPlanMarcoEntity> {
    const entidad = await this.findById(id);
    if (!entidad) throw new NotFoundException(`No se encontró la evaluación de plan marco con id ${id}`);
    Object.assign(entidad, dto);
    return this.repository.save(entidad);
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.findById(id);
    if (!entidad) throw new NotFoundException(`No se encontró la evaluación de plan marco con id ${id}`);
    await this.repository.remove(entidad);
  }
}
