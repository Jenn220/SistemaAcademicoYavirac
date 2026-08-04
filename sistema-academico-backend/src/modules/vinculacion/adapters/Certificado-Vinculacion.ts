import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

@Injectable()
export class CertificadoVinculacionAdapter {

  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly repo: Repository<VinculacionEstudianteEntity>,
  ) {}

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

      -- 👇 Prioriza Entidad Receptora, de lo contrario usa la Empresa
      COALESCE(er.nombre_entidad, emp.razon_social, 'Sin Institución Asignada') AS institucion,

      -- 👇 Trae al tutor de la entidad receptora si existe
      er.tutor_entidad_receptora AS representante

    FROM vinculacion_estudiante vinc
    INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
    INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
    INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
    INNER JOIN carrera car ON m.id_carrera = car.id_carrera
    
    -- 👇 Cambiados a LEFT JOIN para evitar fallos si alguno es nulo
    LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
    LEFT JOIN vinculacion_entidad_receptora er ON vinc.id_entidad_receptora = er.id_entidad

    WHERE vinc.id_vinculacion = $1;
  `;
  const rows = await this.repo.query(query, [idVinculacion]);
  return rows.length > 0 ? rows[0] : null;
}

 }