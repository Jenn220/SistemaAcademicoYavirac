import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionVinculacion } from '../domain/vinculacion-evaluacion';
import { DetalleEvaluacionVinculacion } from '../domain/detalle-evaluacion-vinculacion.entity';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateEvaluacionDto } from '../dto/update-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';

@Injectable()
export class VinculacionEvaluacionAdapter {
  constructor(
    @InjectRepository(EvaluacionVinculacion)
    private readonly evaluacionRepo: Repository<EvaluacionVinculacion>,

    @InjectRepository(DetalleEvaluacionVinculacion)
    private readonly detalleRepo: Repository<DetalleEvaluacionVinculacion>,
  ) {}

  async crearEvaluacion(datos: CreateEvaluacionDto): Promise<EvaluacionVinculacion> {
    const nuevaEvaluacion = this.evaluacionRepo.create({
      idVinculacion: datos.idVinculacion.toString(),
      idRubrica: datos.idRubrica.toString(),
      notaFinal: datos.notaFinal,
      fechaEvaluacion: new Date(datos.fechaEvaluacion),
    });
    return await this.evaluacionRepo.save(nuevaEvaluacion);
  }

  async crearDetalleEvaluacion(datos: CreateDetalleEvaluacionDto): Promise<DetalleEvaluacionVinculacion> {
    const nuevoDetalle = this.detalleRepo.create({
      idEvaluacionVinc: datos.idEvaluacionVinc.toString(),
      idItem: datos.idItem.toString(),
      puntajeAsignado: datos.puntajeAsignado,
    });
    return await this.detalleRepo.save(nuevoDetalle);
  }

  async obtenerTodasLasEvaluaciones(): Promise<EvaluacionVinculacion[]> {
    return await this.evaluacionRepo.find();
  }

  async obtenerEvaluacionPorVinculacion(idVinculacion: number): Promise<EvaluacionVinculacion | null> {
    return await this.evaluacionRepo.findOne({
      where: { idVinculacion: idVinculacion.toString() } as any,
    });
  }

 async obtenerDetallesEvaluacion(idEvaluacion?: number): Promise<DetalleEvaluacionVinculacion[]> {
  if (idEvaluacion) {
    return await this.obtenerDetallesPorEvaluacion(idEvaluacion);
  }
  return await this.detalleRepo.find({ order: { idDetalleVinc: 'ASC' } });
}

  async obtenerDetallesPorEvaluacion(idEvaluacionVinc: number): Promise<DetalleEvaluacionVinculacion[]> {
    return await this.detalleRepo.find({
      where: { idEvaluacionVinc: idEvaluacionVinc.toString() as any },
      order: { idDetalleVinc: 'ASC' },
    });
  }

  async actualizarEvaluacion(id: number, datos: UpdateEvaluacionDto): Promise<EvaluacionVinculacion | null> {
    const resultadoUpdate = await this.evaluacionRepo.update(id, datos as any);
    if (resultadoUpdate.affected === 0) return null;
    return await this.evaluacionRepo.findOne({ where: { idEvaluacionVinc: id as any } });
  }

  async actualizarDetalleEvaluacion(id: number, datos: UpdateDetalleEvaluacionDto): Promise<DetalleEvaluacionVinculacion | null> {
    const datosActualizar: any = {};
    if (datos.idEvaluacionVinc !== undefined) datosActualizar.idEvaluacionVinc = datos.idEvaluacionVinc.toString();
    if (datos.idItem !== undefined) datosActualizar.idItem = datos.idItem.toString();
    if (datos.puntajeAsignado !== undefined) datosActualizar.puntajeAsignado = datos.puntajeAsignado;

    if (Object.keys(datosActualizar).length === 0) {
      return await this.detalleRepo.findOne({ where: { idDetalleVinc: id as any } });
    }

    const resultadoUpdate = await this.detalleRepo.update(id, datosActualizar);
    if (resultadoUpdate.affected === 0) return null;
    return await this.detalleRepo.findOne({ where: { idDetalleVinc: id as any } });
  }

  async eliminarEvaluacion(id: number): Promise<boolean> {
    const resultado = await this.evaluacionRepo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }

  async eliminarDetalleEvaluacion(id: number): Promise<boolean> {
    const resultado = await this.detalleRepo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }

  
}