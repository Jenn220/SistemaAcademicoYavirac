import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { IVinculacionInicioActividadesPort } from '../ports/inicio-actividades-tutor.port';

@Injectable()
export class InicioActividadesTutorAdapter implements IVinculacionInicioActividadesPort {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}

  async obtenerIniciosActividadesPorDocenteRaw(idDocente: number): Promise<any> {
    const query = `
      SELECT 
        vinc.id_vinculacion,
        vinc.nombre_proyecto,
        vinc.fecha_inicio,
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      WHERE vinc.id_docente = $1;
    `;
    return await this.repo.query(query, [idDocente]);
  }

  async obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        CONCAT(doc.nombres, ' ', doc.apellidos) AS tutor_nombre,
        doc.cedula AS tutor_cedula,
        vinc.nombre_proyecto AS proyecto_nombre,
        vinc.fecha_inicio AS fecha_proyecto,
        car.nombre AS carrera,
        inf.actividad_macro AS descripcion_actividades,

        -- 👇 Entidad receptora unificada
        COALESCE(er.nombre_entidad, emp.razon_social, 'Sin Institución Asignada') AS entidad_beneficiaria,
        er.tutor_entidad_receptora AS tutor_entidad,

        -- 👇 Obtención limpia del coordinador evitando espacios vacíos
        COALESCE(
          NULLIF(TRIM(CONCAT(coord.nombres, ' ', coord.apellidos)), ''), 
          'Sin Coordinador Asignado'
        ) AS coordinador

      FROM vinculacion_estudiante vinc
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      LEFT JOIN vinculacion_informe inf ON vinc.id_vinculacion = inf.id_vinculacion

      -- 👇 Integración de Entidad Receptora y Empresa
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad

      -- 👇 Unión para traer al coordinador de la carrera en ese período
      LEFT JOIN periodo_carrera pc ON pc.id_periodo = vinc.id_periodo AND pc.id_carrera = m.id_carrera
      LEFT JOIN docente coord ON pc.id_coordinador = coord.id_docente

      WHERE vinc.id_vinculacion = $1
      LIMIT 1;
    `;
    const rows = await this.repo.query(query, [idVinculacion]);
    return rows.length > 0 ? rows[0] : null;
  }

  async actualizarInicioActividadesRaw(
    idVinculacion: number,
    datos: { nombre_proyecto?: string; fecha_inicio?: string; descripcion_actividades?: string }
  ): Promise<boolean> {
    const { nombre_proyecto, fecha_inicio } = datos;

    // 1. Actualizar datos en vinculacion_estudiante
    if (nombre_proyecto !== undefined || fecha_inicio !== undefined) {
      const updateVincQuery = `
        UPDATE vinculacion_estudiante
        SET 
          nombre_proyecto = COALESCE($1, nombre_proyecto),
          fecha_inicio = COALESCE($2, fecha_inicio)
        WHERE id_vinculacion = $3;
      `;
      await this.repo.query(updateVincQuery, [
        nombre_proyecto ?? null,
        fecha_inicio ?? null,
        idVinculacion,
      ]);
    }

    // 👈 Retorno explícito para cumplir con Promise<boolean>
    return true; 
  }
}