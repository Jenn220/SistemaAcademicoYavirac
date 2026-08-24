// 📁 src/modules/vinculacion/services/vinculacion.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

@Injectable()
export class VinculacionService {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly vinculacionRepo: Repository<VinculacionEstudianteEntity>,
  ) {}

  /**
   * ✅ Obtener vinculación activa de un estudiante
   */
  async obtenerVinculacionActivaPorEstudiante(idEstudiante: number): Promise<any> {
    const query = `
      SELECT 
        vinc.id_vinculacion,
        vinc.id_periodo,
        vinc.id_matricula_detalle,
        vinc.id_empresa,
        vinc.id_docente,
        vinc.id_entidad_receptora,
        vinc.nombre_proyecto,
        vinc.fecha_inicio,
        vinc.fecha_fin,
        vinc.total_horas_estudiante,
        vinc.total_horas_docente,
        vinc.estado
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle md ON md.id_matricula_detalle = vinc.id_matricula_detalle
      INNER JOIN matricula m ON m.id_matricula = md.id_matricula
      WHERE m.id_estudiante = $1
        AND vinc.estado = 'EN_CURSO'
      ORDER BY vinc.id_vinculacion DESC
      LIMIT 1
    `;
    
    const results = await this.vinculacionRepo.query(query, [idEstudiante]);
    return results.length > 0 ? results[0] : null;
  }
}