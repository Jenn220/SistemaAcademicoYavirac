import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEntidadReceptoraDto } from '../dto/create-entidad-receptora.dto';
import { IEntidadReceptoraPort } from '../ports/entidad-receptora.port';
// 1. Importas la entidad real que creaste en domain
import { EntidadReceptoraEntity } from '../domain/entidad-receptora.entity'; 

@Injectable()
export class EntidadReceptoraAdapter implements IEntidadReceptoraPort {
  constructor(
    // 2. Reemplazas TuEntidadTypeOrm por EntidadReceptoraEntity
    @InjectRepository(EntidadReceptoraEntity) 
    private readonly repository: Repository<EntidadReceptoraEntity>, 
  ) {}

  async crearEntidad(data: CreateEntidadReceptoraDto): Promise<any> {
    const query = `
      INSERT INTO vinculacion_entidad_receptora 
        (nombre_entidad, direccion, telefono, correo, tutor_entidad_receptora)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const valores = [
      data.nombre_entidad,
      data.direccion || null,
      data.telefono || null,
      data.correo || null,
      data.tutor_entidad_receptora,
    ];

    const resultado = await this.repository.query(query, valores);
    
    return resultado[0]; 
  }

  async obtenerTodas(): Promise<any[]> {
    const query = `
      SELECT 
        id_entidad,
        nombre_entidad,
        direccion,
        telefono,
        correo,
        tutor_entidad_receptora
      FROM vinculacion_entidad_receptora
      ORDER BY id_entidad ASC;
    `;
    return await this.repository.query(query);
  }

  async obtenerPorId(idEntidad: number): Promise<any | null> {
    const query = `
      SELECT 
        id_entidad,
        nombre_entidad,
        direccion,
        telefono,
        correo,
        tutor_entidad_receptora
      FROM vinculacion_entidad_receptora
      WHERE id_entidad = $1;
    `;
    const resultado = await this.repository.query(query, [idEntidad]);
    return resultado[0] || null;
  }
}