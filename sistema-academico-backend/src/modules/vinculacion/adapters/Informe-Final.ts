import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { IInformeFinalPort } from '../ports/informe-final.port';

@Injectable()
export class InformeFinalAdapter implements IInformeFinalPort {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}

  async obtainInformeFinalRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        car.nombre AS carrera,
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula,
        est.correo AS email_estudiante,
        est.telefono AS telefono_estudiante,
        vinc.nombre_proyecto, 
        vinc.fecha_inicio,
        vinc.fecha_fin,
        COALESCE(er.nombre_entidad, emp.razon_social) AS entidad_beneficiaria,
        COALESCE(er.direccion, emp.direccion) AS direccion_entidad,
        COALESCE(er.telefono, emp.telefono) AS telefono_entidad,
        COALESCE(er.correo, emp.correo) AS email_entidad,
        COALESCE(er.tutor_entidad_receptora, 'Sin tutor asignado') AS tutor_entidad,
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
        CONCAT(coord.nombres, ' ', coord.apellidos) AS coordinador,
        ev.nota_final,
        (
          SELECT observacion 
          FROM vinculacion_reporte_observacion 
          WHERE id_vinculacion = vinc.id_vinculacion 
            AND tipo_reporte = 'INFORME_FINAL' 
          LIMIT 1
        ) AS observaciones_evaluacion,
        (
          SELECT observacion 
          FROM vinculacion_reporte_observacion 
          WHERE id_vinculacion = vinc.id_vinculacion 
            AND tipo_reporte = 'ASISTENCIA_ESTUDIANTE' 
          LIMIT 1
        ) AS reflexion_estudiante,
        (
          SELECT json_agg(
                   json_build_object(
                     'objetivo', obj.descripcion,
                     'orden', obj.orden,
                     'actividades', 'Actividades según objetivo',
                     'avance', '100%',
                     'resultados', 'Completado'
                   ) ORDER BY obj.orden ASC
                 )
          FROM vinculacion_objetivo obj
          WHERE obj.id_vinculacion = vinc.id_vinculacion
        ) AS objetivos_proyecto,
        act.fecha AS actividad_fecha,
        act.actividades_realizadas AS actividades_realizadas,
        act.horas_total AS actividad_horas,
        act.resultado_aprendizaje AS actividad_observaciones
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad
      LEFT JOIN periodo_carrera pc ON pc.id_periodo = vinc.id_periodo AND pc.id_carrera = m.id_carrera
      LEFT JOIN docente coord ON pc.id_coordinador = coord.id_docente
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
      LEFT JOIN evaluacion_vinculacion ev ON vinc.id_vinculacion = ev.id_vinculacion
      WHERE vinc.id_vinculacion = $1
      ORDER BY act.fecha ASC;
    `;
    return await this.repo.query(query, [idVinculacion]);
  }

 async listarInformesEstudiantesPorDocente(idDocente: number): Promise<any[]> {
  const query = `
    SELECT 
      vinc.id_vinculacion,
      CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
      est.cedula,
      car.nombre AS carrera,
      vinc.nombre_proyecto,
      COALESCE(er.nombre_entidad, emp.razon_social, 'Sin Institución') AS entidad_beneficiaria,
      ev.nota_final,
      per.nombre AS periodo_academico, -- Usamos el alias 'per' definido en el JOIN
      CASE 
        WHEN ev.nota_final IS NOT NULL THEN 'CALIFICADO'
        WHEN EXISTS (
          SELECT 1 FROM vinculacion_actividad_estudiante act 
          WHERE act.id_vinculacion = vinc.id_vinculacion
        ) THEN 'EN_PROCESO'
        ELSE 'PENDIENTE'
      END AS estado_informe
    FROM vinculacion_estudiante vinc
    INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo -- Nombre de tabla corregido
    INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
    INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
    INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
    INNER JOIN carrera car ON m.id_carrera = car.id_carrera
    LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
    LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad
    LEFT JOIN evaluacion_vinculacion ev ON vinc.id_vinculacion = ev.id_vinculacion
    WHERE vinc.id_docente = $1
    ORDER BY est.apellidos ASC, est.nombres ASC;
  `;
  return await this.repo.query(query, [idDocente]);
}
}