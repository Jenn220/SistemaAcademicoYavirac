import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';
import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';

@Injectable()
export class VinculacionAsistenciaEstudianteAdapter {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repoEstudiante: Repository<VinculacionEstudianteEntity>,

    @InjectRepository(VinculacionActividadEstudiante)
    private readonly repoActividad: Repository<VinculacionActividadEstudiante>,
  ) {}

  // =========================================================================
  // 🟢 MÉTODOS CRUD
  // =========================================================================

  async crearActividadEstudiante(datos: any): Promise<VinculacionActividadEstudiante> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(),
    };

    const nueva = this.repoActividad.create(datosParaGuardar as any);
    const resultado = await this.repoActividad.save(nueva);

    return Array.isArray(resultado) ? resultado[0] : resultado;
  }
async buscarPorId(idActividad: number): Promise<VinculacionActividadEstudiante | null> {
  return await this.repoActividad.findOne({
    where: { id_actividad_estudiante: idActividad.toString() } as any,
  });
}
  async actualizarActividadEstudiante(
    id: number, 
    datos: any
  ): Promise<VinculacionActividadEstudiante | null> {
    const idString = id.toString();

    const registro = await this.repoActividad.findOne({
      where: { id_actividad_estudiante: idString } as any,
    });

    if (!registro) return null;

    const { id_vinculacion, ...restoDatos } = datos;
    const datosAActualizar: Record<string, any> = {
      ...restoDatos,
      ...(id_vinculacion !== undefined && { id_vinculacion: String(id_vinculacion) }),
    };

    const entidadActualizada = this.repoActividad.merge(registro, datosAActualizar);
    return await this.repoActividad.save(entidadActualizada);
  }

  async eliminarActividadEstudiante(
    idActividad: number, 
    idVinculacionPropia?: string | number
  ): Promise<boolean> {
    const whereCondition: Record<string, any> = {
      id_actividad_estudiante: idActividad.toString(),
    };

    // 🟢 NORMALIZACIÓN A STRING: Garantiza coherencia con el tipo de dato en la BD
    if (idVinculacionPropia !== undefined && idVinculacionPropia !== null) {
      whereCondition.id_vinculacion = idVinculacionPropia.toString();
    }

    const resultado = await this.repoActividad.delete(whereCondition as any);
    return (resultado.affected ?? 0) > 0;
  }

  // =========================================================================
  // 🔎 CONSULTAS DE APOYO Y VALIDACIÓN
  // =========================================================================

  async buscarPorFechaYVinculacion(
    id_vinculacion: number | string, 
    fecha: string
  ): Promise<VinculacionActividadEstudiante | null> {
    return await this.repoActividad.findOne({
      where: {
        id_vinculacion: id_vinculacion.toString(),
        fecha: fecha,
      } as any,
    });
  }

  // 🟢 CONSULTA RECOMENDADA: Obtiene el id_vinculacion mediante el ID del usuario/estudiante
  async obtenerIdVinculacionPorEstudiante(idUsuario: number | string): Promise<string | null> {
    const query = `
      SELECT vinc.id_vinculacion 
      FROM vinculacion_estudiante vinc
      LEFT JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      LEFT JOIN matricula m ON mat.id_matricula = m.id_matricula
      LEFT JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      WHERE est.id_estudiante::text = $1::text OR vinc.id_vinculacion::text = $1::text
      LIMIT 1;
    `;
    const res = await this.repoEstudiante.query(query, [idUsuario.toString()]);
    return res.length > 0 ? res[0].id_vinculacion : null;
  }

  // =========================================================================
  // 📊 CONSULTA RAW REPORTE
  // =========================================================================

  async obtenerAsistenciaEstudianteRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        vinc.id_vinculacion,
        car.nombre AS carrera,
        COALESCE(er.nombre_entidad, emp.razon_social, 'Sin Institución Asignada') AS entidad_beneficiaria,
        est.nombres AS est_nombres,
        est.apellidos AS est_apellidos,
        vinc.nombre_proyecto,
        doc.nombres AS doc_nombres,
        doc.apellidos AS doc_apellidos,
        er.tutor_entidad_receptora AS tutor_entidad,
        per.nombre AS periodo_academico,
        vinc.total_horas_estudiante,
        act.id_actividad_estudiante AS id_actividad,
        act.fecha,
        act.hora_inicio,
        act.hora_fin,
        act.horas_total,
        act.actividades_realizadas AS descripcion
      FROM vinculacion_estudiante vinc
      LEFT JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      LEFT JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      LEFT JOIN matricula m ON mat.id_matricula = m.id_matricula
      LEFT JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      LEFT JOIN carrera car ON m.id_carrera = car.id_carrera
      LEFT JOIN docente doc ON vinc.id_docente = doc.id_docente
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion::text = act.id_vinculacion::text
      WHERE vinc.id_vinculacion::text = $1::text
      ORDER BY act.fecha ASC, act.hora_inicio ASC;
    `;

    return await this.repoEstudiante.query(query, [idVinculacion.toString()]);
  }
  async guardarObservacion(dto: { id_vinculacion: number; tipo_reporte: string; observacion: string }) {
  const query = `
    INSERT INTO vinculacion_observaciones (id_vinculacion, tipo_reporte, observacion)
    VALUES ($1, $2, $3)
    ON CONFLICT (id_vinculacion, tipo_reporte) 
    DO UPDATE SET observacion = EXCLUDED.observacion;
  `;
  
  return await this.repoEstudiante.query(query, [
    dto.id_vinculacion,
    dto.tipo_reporte,
    dto.observacion,
  ]);
}
}