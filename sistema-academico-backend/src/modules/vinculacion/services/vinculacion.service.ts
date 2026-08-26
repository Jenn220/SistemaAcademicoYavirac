// 📁 src/modules/vinculacion/services/vinculacion.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
// Importa también tu DTO de actualización si lo tienes (ej: UpdateVinculacionDto)

@Injectable()
export class VinculacionService {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly vinculacionRepo: Repository<VinculacionEstudianteEntity>,
  ) {}

  /**
   * ✅ Crear vinculación obteniendo automáticamente el id_periodo y validando el período activo
   */
  async create(createDto: CreateVinculacionDto): Promise<any> {
    const queryRuta = `
      SELECT 
        pc.id_periodo_carrera,
        pc.id_periodo,
        pc.estado AS estado_periodo
      FROM matricula_detalle md
      INNER JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
      INNER JOIN periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
      WHERE md.id_matricula_detalle = $1
      LIMIT 1
    `;

    const resultadosRuta = await this.vinculacionRepo.query(queryRuta, [createDto.id_matricula_detalle]);

    if (resultadosRuta.length === 0) {
      throw new NotFoundException(`No se encontró la ruta académica para el id_matricula_detalle: ${createDto.id_matricula_detalle}`);
    }

    const { id_periodo, estado_periodo } = resultadosRuta[0];

    if (estado_periodo !== 'ACTIVO') {
      throw new BadRequestException(`No se puede crear la vinculación. El período asociado no está activo (Estado actual: ${estado_periodo}).`);
    }

    const queryInsert = `
      INSERT INTO vinculacion_estudiante (
        id_periodo,
        id_matricula_detalle,
        id_empresa,
        id_docente,
        id_entidad_receptora,
        nombre_proyecto,
        fecha_inicio,
        fecha_fin,
        total_horas_estudiante,
        total_horas_docente,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      id_periodo,
      createDto.id_matricula_detalle,
      createDto.id_empresa,
      createDto.id_docente,
      createDto.id_entidad_receptora || null,
      createDto.nombre_proyecto,
      createDto.fecha_inicio,
      createDto.fecha_fin,
      createDto.total_horas_estudiante ?? 0,
      createDto.total_horas_docente ?? 0,
      createDto.estado || 'EN_CURSO',
    ];

    const nuevaVinculacion = await this.vinculacionRepo.query(queryInsert, values);
    return nuevaVinculacion[0];
  }

  /**
   * ✅ Actualizar vinculación respetando la regla del periodo ACTIVO (Regla 8)
   */
  async update(idVinculacion: number, updateDto: any): Promise<any> {
    // 1. Verificar que la vinculación exista y obtener su ruta para chequear el estado del período
    const queryRutaVinculacion = `
      SELECT 
        vinc.id_vinculacion,
        pc.estado AS estado_periodo
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle md ON md.id_matricula_detalle = vinc.id_matricula_detalle
      INNER JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
      INNER JOIN periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
      WHERE vinc.id_vinculacion = $1
      LIMIT 1
    `;

    const resultado = await this.vinculacionRepo.query(queryRutaVinculacion, [idVinculacion]);

    if (resultado.length === 0) {
      throw new NotFoundException(`No se encontró la vinculación con ID ${idVinculacion}`);
    }

    const { estado_periodo } = resultado[0];

    // 2. REGLA INSTITUCIONAL: Si el período está FINALIZADO, no se permite modificar nada
    if (estado_periodo === 'FINALIZADO') {
      throw new BadRequestException('No se puede modificar la vinculación porque el período académico/carrera se encuentra FINALIZADO.');
    }

    // 3. Proceder con la actualización si el período está ACTIVO (u otro estado permitido)
    // Aquí puedes construir dinámicamente tu query de UPDATE o usar el repositorio de TypeORM
    const vinculacionExistente = await this.vinculacionRepo.findOne({ where: { id_vinculacion: idVinculacion as any } });
    
    if (!vinculacionExistente) {
      throw new NotFoundException(`Vinculación no encontrada.`);
    }

    Object.assign(vinculacionExistente, updateDto);
    return await this.vinculacionRepo.save(vinculacionExistente);
  }

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