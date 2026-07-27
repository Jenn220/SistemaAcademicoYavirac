import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { UpdateVinculacionEstudianteDto } from '../dto/update-vinculacion-estudiante.dto';

@Injectable()
export class VinculacionEstudianteAdapter {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}

  async crearVinculacion(datos: CreateVinculacionDto): Promise<VinculacionEstudianteEntity> {
    const datosParaGuardar = {
      ...datos,
      id_periodo: datos.id_periodo.toString(),
      id_matricula_detalle: datos.id_matricula_detalle.toString(),
      id_empresa: datos.id_empresa.toString(),
      id_docente: datos.id_docente.toString(),
    };
    const nueva = this.repo.create(datosParaGuardar as any);
    const resultado = await this.repo.save(nueva as any);
    return resultado as VinculacionEstudianteEntity;
  }

  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.repo.find();
  }

  async buscarVinculacionActiva(idEstudiante: number): Promise<any> {
    const query = `
      SELECT 
        vinc.id_vinculacion AS id_vinc,
        vinc.estado AS estado,
        vinc.nombre_proyecto AS nombre_proyecto,
        emp.razon_social AS empresa
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle matdet ON vinc.id_matricula_detalle = matdet.id_matricula_detalle
      INNER JOIN matricula mat ON matdet.id_matricula = mat.id_matricula
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      WHERE mat.id_estudiante = $1
      ORDER BY vinc.id_vinculacion DESC
      LIMIT 1;
    `;
    const resultados = await this.repo.query(query, [idEstudiante]);
    return resultados.length > 0 ? resultados[0] : null;
  }

  async actualizarVinculacionEstudiante(id: number, datos: UpdateVinculacionEstudianteDto): Promise<VinculacionEstudianteEntity | null> {
    const resultadoUpdate = await this.repo.update(id, datos as any);
    if (resultadoUpdate.affected === 0) return null;
    return await this.repo.findOne({ where: { id_vinculacion: id as any } });
  }

  async eliminarVinculacionEstudiante(id: number): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
  async verificarRequisitosCierre(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        vinc.id_vinculacion,
        vinc.estado,
        vinc.horas_cumplidas,
        COUNT(eval.id_evaluacion_vinc) AS total_evaluaciones
      FROM vinculacion_estudiante vinc
      LEFT JOIN evaluacion_vinculacion eval ON eval.id_vinculacion = vinc.id_vinculacion
      WHERE vinc.id_vinculacion = $1
      GROUP BY vinc.id_vinculacion, vinc.estado, vinc.horas_cumplidas;
    `;

    const resultados = await this.repo.query(query, [idVinculacion]);
    return resultados.length > 0 ? resultados[0] : null;
  }
}