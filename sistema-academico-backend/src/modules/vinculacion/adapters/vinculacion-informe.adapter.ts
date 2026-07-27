import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionInforme } from '../domain/vinculacion-informe.entity';
import { CreateInformeDto } from '../dto/create-informe.dto';
import { UpdateInformeDto } from '../dto/update-informe.dto';

@Injectable()
export class VinculacionInformeAdapter {
  constructor(
    @InjectRepository(VinculacionInforme)
    private readonly repo: Repository<VinculacionInforme>,
  ) {}

  async crearInforme(datos: CreateInformeDto): Promise<VinculacionInforme> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(),
    };
    const nuevo = this.repo.create(datosParaGuardar as any);
    const resultado = await this.repo.save(nuevo as any);
    return resultado as VinculacionInforme;
  }

  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.repo.find();
  }

  async actualizarInforme(id: number, datos: UpdateInformeDto): Promise<VinculacionInforme | null> {
    const datosActualizar: any = {};
    if (datos.idVinculacion !== undefined) datosActualizar.id_vinculacion = datos.idVinculacion;
    if (datos.fechaInforme !== undefined) datosActualizar.fecha_informe = datos.fechaInforme;
    if (datos.actividadMacro !== undefined) datosActualizar.actividad_macro = datos.actividadMacro;
    if (datos.resultadoAprendizaje !== undefined) datosActualizar.resultado_aprendizaje = datos.resultadoAprendizaje;

    if (Object.keys(datosActualizar).length === 0) {
      return await this.repo.findOne({ where: { id_informe: id as any } });
    }

    const resultadoUpdate = await this.repo.update(id, datosActualizar);
    if (resultadoUpdate.affected === 0) return null;

    return await this.repo.findOne({ where: { id_informe: id as any } });
  }

  async eliminarInforme(id: number): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
}