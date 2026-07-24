import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

@Injectable()
export class VinculacionReportesAdapter {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}

  async obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        CONCAT(doc.nombres, ' ', doc.apellidos) AS tutor_nombre,
        doc.cedula AS tutor_cedula,
        vinc.nombre_proyecto AS proyecto_nombre,
        vinc.fecha_inicio AS fecha_proyecto,
        car.nombre AS carrera,
        inf.actividad_macro AS descripcion_actividades
      FROM vinculacion_estudiante vinc
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      LEFT JOIN vinculacion_informe inf ON vinc.id_vinculacion = inf.id_vinculacion
      WHERE vinc.id_vinculacion = $1
      LIMIT 1;
    `;
    const rows = await this.repo.query(query, [idVinculacion]);
    return rows.length > 0 ? rows[0] : null;
  }

 async obtainActaCompromisoRaw(idVinculacion: number): Promise<any> {
  const query = `
    SELECT 
      CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
      est.cedula AS cedula_identidad, 
      car.nombre AS carrera,
      
      -- Subconsulta para el nivel
      (
        SELECT n.nombre 
        FROM matricula_detalle md
        INNER JOIN oferta_asignatura oa ON md.id_oferta_asignatura = oa.id_oferta_asignatura
        INNER JOIN asignatura asig ON oa.id_asignatura = asig.id_asignatura
        INNER JOIN nivel n ON asig.id_nivel = n.id_nivel
        WHERE md.id_matricula = m.id_matricula
        LIMIT 1
      ) AS nivel,
      
      emp.razon_social AS entidad_beneficiaria,
      CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor
    FROM vinculacion_estudiante vinc
    INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
    INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
    INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
    INNER JOIN carrera car ON m.id_carrera = car.id_carrera
    INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
    INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
    WHERE vinc.id_vinculacion = $1;
  `;
  const rows = await this.repo.query(query, [idVinculacion]);
  return rows.length > 0 ? rows[0] : null;
}

  async obtainReporteConsolidadoRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        car.nombre AS carrera,
        emp.razon_social AS entidad_beneficiaria,
        est.nombres AS est_nombres,
        est.apellidos AS est_apellidos,
        vinc.nombre_proyecto,
        doc.nombres AS doc_nombres,
        doc.apellidos AS doc_apellidos,
        NULL AS tut_nombres, 
        NULL AS tut_apellidos,
        per.nombre AS periodo_academico,
        vinc.total_horas_estudiante,
        act.fecha,
        act.hora_inicio,
        act.hora_fin,
        act.horas_total,
        act.actividades_realizadas
      FROM vinculacion_estudiante vinc
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      WHERE vinc.id_vinculacion = $1
      ORDER BY act.fecha ASC;
    `;
    return await this.repo.query(query, [idVinculacion]);
  }

 async obtainReporteAsistenciaTutorRaw(idVinculacion: number): Promise<any[]> {
  const query = `
    SELECT 
      car.nombre AS carrera,
      emp.razon_social AS entidad_beneficiaria,
      CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
      per.nombre AS periodo_academico,
      COALESCE(
        CONCAT(coord.nombres, ' ', coord.apellidos), 
        'Sin Coordinador Asignado'
      ) AS coordinador_carrera,
      ast.fecha,
      ast.hora_inicio,
      ast.hora_fin,
      ast.horas_total,
      ast.observaciones AS actividades_realizadas
    FROM vinculacion_estudiante vinc
    LEFT JOIN vinculacion_asistencia_tutor ast ON vinc.id_vinculacion = ast.id_vinculacion
    INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
    INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
    INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
    INNER JOIN carrera car ON m.id_carrera = car.id_carrera
    INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
    INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
    -- Unión con periodo_carrera para identificar al coordinador de esa carrera en ese período
    LEFT JOIN periodo_carrera pc ON pc.id_periodo = vinc.id_periodo AND pc.id_carrera = m.id_carrera
    LEFT JOIN docente coord ON pc.id_coordinador = coord.id_docente
    WHERE vinc.id_vinculacion = $1
    ORDER BY ast.fecha ASC;
  `;
  return await this.repo.query(query, [idVinculacion]);
}
async obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]> {
  const query = `
    SELECT 
      emp.razon_social AS entidad_beneficiaria,
      
      -- Extraemos el 'nombre' del nivel a través de la primera asignatura matriculada
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
  async obtainCertificadoVinculacionRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula,
        car.nombre AS carrera,
        vinc.nombre_proyecto,
        vinc.fecha_inicio,
        vinc.fecha_fin,
        vinc.total_horas_estudiante,
        emp.razon_social AS institucion,
        NULL AS representante
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      WHERE vinc.id_vinculacion = $1;
    `;
    const rows = await this.repo.query(query, [idVinculacion]);
    return rows.length > 0 ? rows[0] : null;
  }

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
      emp.razon_social AS entidad_beneficiaria,
      emp.direccion AS direccion_entidad,
      emp.telefono AS telefono_entidad,
      emp.correo AS email_entidad,
      CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
      
      -- Campos asignados como pendientes a petición:
      'Pendiente' AS tutor_entidad,
      
      CONCAT(coord.nombres, ' ', coord.apellidos) AS coordinador,
      ev.nota_final,
      
      'Pendiente' AS observaciones_evaluacion,
      'Pendiente' AS reflexion_estudiante,

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
    
    -- El JOIN del coordinador
    LEFT JOIN periodo_carrera pc ON pc.id_periodo = vinc.id_periodo AND pc.id_carrera = m.id_carrera
    LEFT JOIN docente coord ON pc.id_coordinador = coord.id_docente
    
    LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
    LEFT JOIN evaluacion_vinculacion ev ON vinc.id_vinculacion = ev.id_vinculacion
    WHERE vinc.id_vinculacion = $1
    ORDER BY act.fecha ASC;
  `;
  return await this.repo.query(query, [idVinculacion]);
}
}