import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { IInformeActividadesPort } from '../ports/informe-actividades.port';

@Injectable()
export class InformeActividadesAdapter implements IInformeActividadesPort {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}

  async obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        act.id_actividad_estudiante AS id_actividad_estudiante,
        emp.razon_social AS entidad_beneficiaria,
        (
          SELECT n.nombre 
          FROM matricula_detalle md
          INNER JOIN oferta_asignatura oa ON md.id_oferta_asignatura = oa.id_oferta_asignatura
          INNER JOIN asignatura asig ON oa.id_asignatura = asig.id_asignatura
          INNER JOIN nivel n ON asig.id_nivel = n.id_nivel
          WHERE md.id_matricula = m.id_matricula
          LIMIT 1
        ) AS nivel,
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula AS cedula_identidad,
        per.nombre AS ciclo_academico,
        vinc.fecha_inicio AS inicia,
        vinc.fecha_fin AS finaliza,
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
        vinc.nombre_proyecto,
        (
          SELECT STRING_AGG(asig.nombre, ' | ') 
          FROM matricula_detalle md
          INNER JOIN oferta_asignatura oa ON md.id_oferta_asignatura = oa.id_oferta_asignatura
          INNER JOIN asignatura asig ON oa.id_asignatura = asig.id_asignatura
          WHERE md.id_matricula = m.id_matricula
        ) AS asignaturas,
        -- ✅ AGREGA ESTA SUBCONSULTA AQUÍ:
        (
          SELECT observacion 
          FROM vinculacion_reporte_observacion 
          WHERE id_vinculacion = vinc.id_vinculacion 
            AND tipo_reporte = 'ASISTENCIA_ESTUDIANTE' 
          LIMIT 1
        ) AS reflexion_estudiante,
        act.fecha,
        act.actividades_realizadas,
        act.resultado_aprendizaje
      FROM vinculacion_estudiante vinc
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      WHERE vinc.id_vinculacion = $1
      ORDER BY act.fecha ASC;
    `;
    return await this.repo.query(query, [idVinculacion]);
  }

  async actualizarResultadoAprendizaje(
    idActividad: number,
    resultadoAprendizaje: string,
  ): Promise<any> {
    const query = `
      UPDATE vinculacion_actividad_estudiante
      SET resultado_aprendizaje = $1
      WHERE id_actividad_estudiante = $2
    `;
    return await this.repo.query(query, [resultadoAprendizaje, idActividad]);
  }

  async obtenerActividadPorId(idActividad: number): Promise<any> {
    const query = `
      SELECT id_actividad_estudiante, id_vinculacion, resultado_aprendizaje
      FROM vinculacion_actividad_estudiante
      WHERE id_actividad_estudiante = $1
      LIMIT 1;
    `;
    const resultado = await this.repo.query(query, [idActividad]);
    return resultado.length > 0 ? resultado[0] : null;
  }

  async guardarOActualizarObservacion(
    idVinculacion: number,
    tipoReporte: string,
    observacion: string,
  ): Promise<any> {
    const querySelect = `
      SELECT id_observacion FROM vinculacion_reporte_observacion 
      WHERE id_vinculacion = $1 AND tipo_reporte = $2 
      LIMIT 1;
    `;
    const existente = await this.repo.query(querySelect, [idVinculacion, tipoReporte]);

    if (existente && existente.length > 0) {
      const queryUpdate = `
        UPDATE vinculacion_reporte_observacion 
        SET observacion = $3 
        WHERE id_vinculacion = $1 AND tipo_reporte = $2;
      `;
      return await this.repo.query(queryUpdate, [idVinculacion, tipoReporte, observacion]);
    } else {
      const queryInsert = `
        INSERT INTO vinculacion_reporte_observacion (id_vinculacion, tipo_reporte, observacion)
        VALUES ($1, $2, $3);
      `;
      return await this.repo.query(queryInsert, [idVinculacion, tipoReporte, observacion]);
    }
  }
}