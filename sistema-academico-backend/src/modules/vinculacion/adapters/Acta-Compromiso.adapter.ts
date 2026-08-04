import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

@Injectable()
export class CartaCompromisoReportesAdapter {

  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}



async obtainActaCompromisoRaw(idVinculacion: number): Promise<any> {
  const query = `
    SELECT 
      CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
      est.cedula AS cedula_identidad, 
      car.nombre AS carrera,
      
      -- Subconsulta para el nivel académico
      (
        SELECT n.nombre 
        FROM matricula_detalle md
        INNER JOIN oferta_asignatura oa ON md.id_oferta_asignatura = oa.id_oferta_asignatura
        INNER JOIN asignatura asig ON oa.id_asignatura = asig.id_asignatura
        INNER JOIN nivel n ON asig.id_nivel = n.id_nivel
        WHERE md.id_matricula = m.id_matricula
        LIMIT 1
      ) AS nivel,
      
      -- Solo consultamos la tabla propia de Vinculación (vinculacion_entidad_receptora)
      COALESCE(er.nombre_entidad, 'Sin Entidad Asignada') AS entidad_beneficiaria,
      
      CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor
    FROM vinculacion_estudiante vinc
    INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
    INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
    INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
    INNER JOIN carrera car ON m.id_carrera = car.id_carrera
    INNER JOIN docente doc ON vinc.id_docente = doc.id_docente

    -- Único JOIN para la entidad beneficiaria de Vinculación
    LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad

    WHERE vinc.id_vinculacion = $1;
  `;
  const rows = await this.repo.query(query, [idVinculacion]);
  return rows.length > 0 ? rows[0] : null;
}





 






  
}