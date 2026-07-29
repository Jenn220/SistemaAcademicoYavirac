import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DETALLE_EVALUACION_REPOSITORY, IDetalleEvaluacionRepository } from '../ports/detalle-evaluacion.repository.port';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';

@Injectable()
export class DetalleEvaluacionService {
  constructor(@Inject(DETALLE_EVALUACION_REPOSITORY) private readonly repo: IDetalleEvaluacionRepository) {}

  async create(dto: CreateDetalleEvaluacionDto): Promise<DetalleEvaluacionEntity> {
    return this.repo.create(dto);
  }

  async findByEvaluacion(idEvaluacion: number): Promise<DetalleEvaluacionEntity[]> {
    return this.repo.findByEvaluacion(idEvaluacion);
  }

  async findOne(id: number): Promise<DetalleEvaluacionEntity> {
    const detalle = await this.repo.findOne(id);
    if (!detalle) throw new NotFoundException(`Detalle de evaluación con id ${id} no encontrado`);
    return detalle;
  }

  async update(id: number, dto: UpdateDetalleEvaluacionDto): Promise<DetalleEvaluacionEntity> {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.repo.remove(id);
  }
}
