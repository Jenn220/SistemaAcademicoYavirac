import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PortafolioRepository } from '../ports/portafolio.repository';
import { OfertaDocenteDto } from '../dto/oferta-docente.dto';

@Injectable()
export class PortafolioPg implements PortafolioRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findOfertasByDocente(idDocente: number): Promise<OfertaDocenteDto[]> {
    return this.dataSource.query(
      `
      SELECT
        oa.id_oferta_asignatura,
        a.nombre  AS asignatura,
        p.nombre  AS paralelo,
        pa.id_periodo,
        pa.nombre AS periodo,
        oa.estado
      FROM oferta_asignatura oa
      JOIN periodo_carrera   pc ON oa.id_periodo_carrera = pc.id_periodo_carrera
      JOIN periodo_academico pa ON pc.id_periodo = pa.id_periodo
      JOIN asignatura        a  ON oa.id_asignatura = a.id_asignatura
      JOIN paralelo          p  ON oa.id_paralelo = p.id_paralelo
      WHERE oa.id_docente = $1
      ORDER BY pa.fecha_inicio DESC
      `,
      [idDocente],
    );
  }
}
