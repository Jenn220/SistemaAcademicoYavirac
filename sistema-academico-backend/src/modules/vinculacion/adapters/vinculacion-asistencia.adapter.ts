import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';

@Injectable()
export class VinculacionAsistenciaAdapter {
  constructor(
    @InjectRepository(VinculacionAsistenciaTutor)
    private readonly repo: Repository<VinculacionAsistenciaTutor>,
  ) {}

  async crearAsistenciaTutor(datos: CreateAsistenciaTutorDto): Promise<VinculacionAsistenciaTutor> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(),
    };
    const nueva = this.repo.create(datosParaGuardar as any);
    const resultado = await this.repo.save(nueva as any);
    return resultado as VinculacionAsistenciaTutor;
  }

  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.repo.find();
  }

  async actualizarAsistenciaTutor(id: number, datos: UpdateAsistenciaTutorDto): Promise<VinculacionAsistenciaTutor | null> {
    const resultadoUpdate = await this.repo.update(id, datos as any);
    if (resultadoUpdate.affected === 0) return null;

    return await this.repo.findOne({
      where: { id_asistencia_tutor: id as any },
    });
  }

  async eliminarAsistenciaTutor(id: number): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
}