import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionObjetivo } from '../domain/vinculacion-objetivo.entity';
import { CreateVinculacionObjetivoDto } from '../dto/create-objetivo.dto';
import { UpdateObjetivoDto } from '../dto/update-objetivo.dto';
// 1. Importa la interfaz del puerto
import { IVinculacionObjetivosPort } from '../ports/vinculacion-objetivos.port';

@Injectable()
// 2. Agrega "implements IVinculacionObjetivosPort" (esto evita que vuelva a pasar)
export class VinculacionObjetivosAdapter implements IVinculacionObjetivosPort {
  constructor(
    @InjectRepository(VinculacionObjetivo)
    private readonly repo: Repository<VinculacionObjetivo>,
  ) {}

  // 3. CAMBIA "crearObjetivo" A "crearVinculacionObjetivo"
  async crearVinculacionObjetivo(datos: CreateVinculacionObjetivoDto): Promise<VinculacionObjetivo> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(),
    };
    const nuevo = this.repo.create(datosParaGuardar as any);
    const resultado = await this.repo.save(nuevo as any);
    return resultado as VinculacionObjetivo;
  }

  // 4. Implementa o renombra los métodos según tu puerto:
  async obtenerObjetivosPorVinculacion(idVinculacion: number): Promise<any[]> {
    return await this.repo.find({ 
      where: { id_vinculacion: idVinculacion as any } 
    });
  }

  async obtenerTodosLosObjetivos(): Promise<VinculacionObjetivo[]> {
    return await this.repo.find();
  }

  async actualizarVinculacionObjetivo(id: number, datos: UpdateObjetivoDto): Promise<VinculacionObjetivo | null> {
    const datosActualizar: any = {};
    if (datos.idVinculacion !== undefined) datosActualizar.id_vinculacion = datos.idVinculacion.toString();
    if (datos.descripcion !== undefined) datosActualizar.descripcion = datos.descripcion;
    if (datos.orden !== undefined) datosActualizar.orden = datos.orden;

    if (Object.keys(datosActualizar).length === 0) {
      return await this.repo.findOne({ where: { id_vinculacion_objetivo: id as any } });
    }

    const resultadoUpdate = await this.repo.update(id, datosActualizar);
    if (resultadoUpdate.affected === 0) return null;

    return await this.repo.findOne({ where: { id_vinculacion_objetivo: id as any } });
  }

  async eliminarVinculacionObjetivo(id: number): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
}