import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';
import { IVinculacionAsistenciaTutorPort } from '../ports/asistencia-tutor.port';

@Injectable()
export class AsistenciaTutorAdapter implements IVinculacionAsistenciaTutorPort {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repoEstudiante: Repository<VinculacionEstudianteEntity>,

    @InjectRepository(VinculacionAsistenciaTutor)
    private readonly repoAsistencia: Repository<VinculacionAsistenciaTutor>,
  ) {}

  // =========================================================================
  // 🟢 MÉTODOS CRUD
  // =========================================================================

  async crearAsistenciaTutor(datos: any): Promise<VinculacionAsistenciaTutor> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: Number(datos.id_vinculacion),
    };

    const nuevaEntidad = this.repoAsistencia.create(datosParaGuardar as any);
    const resultado = await this.repoAsistencia.save(nuevaEntidad);

    return Array.isArray(resultado) ? resultado[0] : resultado;
  }

  async actualizarAsistenciaTutor(
    id: number,
    datos: any,
  ): Promise<VinculacionAsistenciaTutor | null> {
    const registroExistente = await this.repoAsistencia.findOne({
      where: { id_asistencia_tutor: id },
    });

    if (!registroExistente) return null;

    const datosAActualizar: any = { ...datos };
    if (datos.id_vinculacion !== undefined) {
      datosAActualizar.id_vinculacion = Number(datos.id_vinculacion);
    }

    const entidadActualizada = this.repoAsistencia.merge(registroExistente, datosAActualizar);
    return await this.repoAsistencia.save(entidadActualizada);
  }

  async eliminarAsistenciaTutor(id: number): Promise<boolean> {
    const resultado = await this.repoAsistencia.delete({ id_asistencia_tutor: id });
    return (resultado.affected ?? 0) > 0;
  }

  // =========================================================================
  // 🔎 CONSULTAS DE APOYO Y VALIDACIÓN
  // =========================================================================

  async buscarPorId(id: number): Promise<VinculacionAsistenciaTutor | null> {
    return await this.repoAsistencia.findOne({
      where: { id_asistencia_tutor: id },
    });
  }

async buscarPorFechaYVinculacion(
  idVinculacion: number,
  fecha: string,
): Promise<VinculacionAsistenciaTutor | null> {
  return await this.repoAsistencia.findOne({
    where: {
      id_vinculacion: Number(idVinculacion),
      fecha: new Date(fecha), // 👈 Convertimos el string a Date
    },
  });
}

  // =========================================================================
  // 📊 MÉTODOS RAW REPORTE Y CONSULTAS
  // =========================================================================

  async obtainReporteAsistenciaTutorRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        car.nombre AS carrera,
        COALESCE(er.nombre_entidad, emp.razon_social, 'Sin Institución Asignada') AS entidad_beneficiaria,
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
        per.nombre AS periodo_academico,
        COALESCE(
          NULLIF(TRIM(CONCAT(coord.nombres, ' ', coord.apellidos)), ''), 
          'Sin Coordinador Asignado'
        ) AS coordinador_carrera,
        (
          SELECT observacion 
          FROM vinculacion_reporte_observacion 
          WHERE id_vinculacion = vinc.id_vinculacion 
            AND tipo_reporte = 'ASISTENCIA_TUTOR' 
          LIMIT 1
        ) AS observacion_reporte,
        ast.id_asistencia_tutor AS id_asistencia,
        ast.fecha,
        ast.hora_inicio,
        ast.hora_fin,
        ast.horas_total,
        ast.actividad_realizada AS actividades_realizadas
      FROM vinculacion_estudiante vinc
      LEFT JOIN vinculacion_asistencia_tutor ast ON vinc.id_vinculacion = ast.id_vinculacion
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad
      LEFT JOIN periodo_carrera pc ON pc.id_periodo = vinc.id_periodo AND pc.id_carrera = m.id_carrera
      LEFT JOIN docente coord ON pc.id_coordinador = coord.id_docente
      WHERE vinc.id_vinculacion = $1
      ORDER BY ast.fecha ASC;
    `;
    
    return await this.repoEstudiante.query(query, [idVinculacion]);
  }

  async obtainAsistenciasTutorPorDocenteRaw(idDocente: number): Promise<any[]> {
    const query = `
      SELECT 
        vinc.id_vinculacion,
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula AS estudiante_cedula,
        car.nombre AS carrera,
        vinc.nombre_proyecto,
        COALESCE(er.nombre_entidad, 'Sin Institución Asignada') AS entidad_beneficiaria,
        per.nombre AS periodo_academico,
        COALESCE(SUM(ast.horas_total), 0) AS total_horas_tutor_registradas,
        COUNT(ast.id_asistencia_tutor) AS total_visitas_registradas
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad
      LEFT JOIN vinculacion_asistencia_tutor ast ON vinc.id_vinculacion = ast.id_vinculacion
      WHERE vinc.id_docente = $1
      GROUP BY 
        vinc.id_vinculacion, 
        est.nombres, 
        est.apellidos, 
        est.cedula, 
        car.nombre, 
        vinc.nombre_proyecto, 
        er.nombre_entidad, 
        per.nombre
      ORDER BY est.apellidos ASC;
    `;

    return await this.repoEstudiante.query(query, [idDocente]);
  }
}