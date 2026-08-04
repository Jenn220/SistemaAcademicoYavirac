import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DETALLE_EVALUACION_REPOSITORY, IDetalleEvaluacionRepository } from '../ports/detalle-evaluacion.repository.port';
import { EVALUACION_PRACTICA_REPOSITORY, IEvaluacionPracticaRepository } from '../ports/evaluacion-practica.repository.port';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';

@Injectable()
export class DetalleEvaluacionService {
  constructor(
    @Inject(DETALLE_EVALUACION_REPOSITORY) private readonly repo: IDetalleEvaluacionRepository,
    @Inject(EVALUACION_PRACTICA_REPOSITORY) private readonly evaluacionRepo: IEvaluacionPracticaRepository,
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
      throw new NotFoundException('No tienes permiso para acceder a esta evaluación');
    }
  }

  async create(usuario: any, dto: CreateDetalleEvaluacionDto): Promise<DetalleEvaluacionEntity> {
    const evaluacion = await this.evaluacionRepo.findById(dto.id_evaluacion);
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con id ${dto.id_evaluacion}`);
    }
    if (!evaluacion.id_practica) {
      throw new NotFoundException(`La evaluación con id ${dto.id_evaluacion} no tiene práctica asociada`);
    }
    await this.esDuenoDePractica(usuario, evaluacion.id_practica!);
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

  async update(usuario: any, id: number, dto: UpdateDetalleEvaluacionDto): Promise<DetalleEvaluacionEntity> {
    const detalle = await this.repo.findOne(id);
    if (!detalle) {
      throw new NotFoundException(`Detalle de evaluación con id ${id} no encontrado`);
    }
    const evaluacion = await this.evaluacionRepo.findById(detalle.id_evaluacion);
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación asociada al detalle con id ${id}`);
    }
    if (!evaluacion.id_practica) {
      throw new NotFoundException(`La evaluación asociada al detalle con id ${id} no tiene práctica asociada`);
    }
    await this.esDuenoDePractica(usuario, evaluacion.id_practica!);
    return this.repo.update(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const detalle = await this.repo.findOne(id);
    if (!detalle) {
      throw new NotFoundException(`Detalle de evaluación con id ${id} no encontrado`);
    }
    const evaluacion = await this.evaluacionRepo.findById(detalle.id_evaluacion);
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación asociada al detalle con id ${id}`);
    }
    if (!evaluacion.id_practica) {
      throw new NotFoundException(`La evaluación asociada al detalle con id ${id} no tiene práctica asociada`);
    }
    await this.esDuenoDePractica(usuario, evaluacion.id_practica!);
    return this.repo.remove(id);
  }
}
