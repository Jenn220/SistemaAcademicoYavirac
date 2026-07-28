import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';

@Injectable()
export class EvaluacionCalculoService {
  constructor(
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionRepository: Repository<EvaluacionPracticaEntity>,
    @InjectRepository(DetalleEvaluacionEntity)
    private readonly detalleRepository: Repository<DetalleEvaluacionEntity>,
  ) {}

  async calcularPromedioPorPractica(idPractica: number): Promise<number> {
    const evaluaciones = await this.evaluacionRepository.find({ where: { id_practica: idPractica } });
    if (evaluaciones.length === 0) return 0;

    const suma = evaluaciones.reduce((acc, e) => acc + (e.nota_final_calculada ?? 0), 0);
    return Number((suma / evaluaciones.length).toFixed(2));
  }

  async calcularPromedioPorItem(idEvaluacion: number): Promise<number> {
    const detalles = await this.detalleRepository.find({ where: { id_evaluacion: idEvaluacion } });
    if (detalles.length === 0) return 0;

    const suma = detalles.reduce((acc, d) => acc + (d.puntaje_asignado ?? 0), 0);
    return Number((suma / detalles.length).toFixed(2));
  }
}
