import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';
import { DETALLE_EVALUACION_REPOSITORY, IDetalleEvaluacionRepository } from '../ports/detalle-evaluacion.repository.port';

@Injectable()
export class DetalleEvaluacionPg implements IDetalleEvaluacionRepository {
  constructor(
    @InjectRepository(DetalleEvaluacionEntity)
    private readonly repository: Repository<DetalleEvaluacionEntity>,
  ) {}

  async create(entity: Partial<DetalleEvaluacionEntity>): Promise<DetalleEvaluacionEntity> {
    const detalle = this.repository.create(entity);
    return this.repository.save(detalle);
  }

  async findByEvaluacion(idEvaluacion: number): Promise<DetalleEvaluacionEntity[]> {
    return this.repository.find({ where: { id_evaluacion: idEvaluacion } });
  }

  async findOne(id: number): Promise<DetalleEvaluacionEntity | null> {
    return this.repository.findOne({ where: { id_detalle_evaluacion: id } });
  }

  async update(id: number, entity: Partial<DetalleEvaluacionEntity>): Promise<DetalleEvaluacionEntity> {
    const detalle = await this.findOne(id);
    if (!detalle) throw new NotFoundException(`Detalle evaluacion con id ${id} no encontrado`);
    Object.assign(detalle, entity);
    return this.repository.save(detalle);
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.findOne(id);
    if (!detalle) throw new NotFoundException(`Detalle evaluacion con id ${id} no encontrado`);
    await this.repository.remove(detalle);
  }
}
