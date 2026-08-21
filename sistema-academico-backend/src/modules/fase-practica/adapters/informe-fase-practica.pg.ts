import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  INFORME_FASE_PRACTICA_REPOSITORY,
  InformeFasePracticaRepository,
} from '../ports/informe-fase-practica.repository.port';

@Injectable()
export class InformeFasePracticaPg implements InformeFasePracticaRepository {
  constructor(private readonly dataSource: DataSource) {}

  async obtenerInformePorIdPractica(idPractica: number): Promise<Record<string, any> | null> {
    const sql = `
      SELECT jsonb_build_object(
        'id_practica', p.id_practica,
        'estado', p.estado,
        'total_horas_requeridas', p.total_horas_requeridas,
        'total_horas_cumplidas', p.total_horas_cumplidas,
        'id_periodo_carrera', pc.id_periodo_carrera,
        'id_periodo', pc.id_periodo,
        'codigo_periodo', pa.codigo,
        'estado_periodo_carrera', pc.estado,
        'id_carrera', pc.id_carrera,
        'carrera', c.nombre,
        'registros_diarios', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'fecha', r.fecha,
            'hora_ingreso', r.hora_ingreso,
            'hora_salida_almuerzo', r.hora_salida_almuerzo,
            'hora_regreso_almuerzo', r.hora_regreso_almuerzo,
            'hora_salida', r.hora_salida,
            'observaciones', r.observaciones,
            'firma_estudiante', r.firma_estudiante
          ) ORDER BY r.fecha)
          FROM registro_diario_practica r
          WHERE r.id_practica = p.id_practica
        ), '[]'::jsonb),
        'informes_aprendizaje', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_informe', i.id_informe,
            'reflexion_aprendizaje', i.reflexion_aprendizaje,
            'observaciones_empresa', i.observaciones_empresa,
            'bitacoras', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'semana', b.semana,
                'fecha_inicio_semana', b.fecha_inicio_semana,
                'fecha_fin_semana', b.fecha_fin_semana,
                'puesto_aprendizaje', b.puesto_aprendizaje,
                'actividades_realizadas', b.actividades_realizadas,
                'actividades_autonomas', b.actividades_autonomas
              ) ORDER BY b.semana)
              FROM bitacora_semanal b
              WHERE b.id_informe = i.id_informe
            ), '[]'::jsonb)
          ))
          FROM informe_aprendizaje i
          WHERE i.id_practica = p.id_practica
        ), '[]'::jsonb),
        'evaluaciones', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_evaluacion', e.id_evaluacion,
            'tipo_evaluador', e.tipo_evaluador,
            'nota_final_calculada', e.nota_final_calculada,
            'fecha_evaluacion', e.fecha_evaluacion
          ))
          FROM evaluacion_practica e
          WHERE e.id_practica = p.id_practica
        ), '[]'::jsonb)
      ) AS informe
      FROM practica_estudiante p
      JOIN matricula_detalle md ON md.id_matricula_detalle = p.id_matricula_detalle
      JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
      JOIN periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
      JOIN periodo_academico pa ON pa.id_periodo = pc.id_periodo
      JOIN carrera c ON c.id_carrera = pc.id_carrera
      WHERE p.id_practica = $1;
    `;

    const rows = await this.dataSource.query(sql, [idPractica]);
    return rows[0]?.informe ?? null;
  }
}
