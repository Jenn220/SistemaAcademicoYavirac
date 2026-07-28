import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';

@Injectable()
export class VinculacionActividadesAdapter {
  constructor(
    @InjectRepository(VinculacionActividadEstudiante)
    private readonly repo: Repository<VinculacionActividadEstudiante>,
  ) {}

  async crearActividadEstudiante(datos: CreateActividadEstudianteDto): Promise<VinculacionActividadEstudiante> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(),
    };
    const nueva = this.repo.create(datosParaGuardar as any);
    const resultado = await this.repo.save(nueva as any);
    return resultado as VinculacionActividadEstudiante;
  }

  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.repo.find();
  }

  async actualizarActividadEstudiante(id: number, datos: UpdateActividadEstudianteDto): Promise<VinculacionActividadEstudiante | null> {
    const resultadoUpdate = await this.repo.update(id, datos as any);
    if (resultadoUpdate.affected === 0) return null;

    return await this.repo.findOne({
      where: { id_actividad_estudiante: id as any },
    });
  }

  async eliminarActividadEstudiante(id: number): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
}