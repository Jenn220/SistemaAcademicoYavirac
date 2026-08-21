import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface PeriodoContexto {
  id_periodo_carrera: number;
  id_periodo: number;
  id_carrera: number;
  estado_periodo_carrera: string;
  id_estudiante: number;
  codigo_periodo?: string;
}

@Injectable()
export class PeriodoContextService {
  constructor(private readonly dataSource: DataSource) {}

  async obtenerContextoDesdeMatriculaDetalle(idMatriculaDetalle: number): Promise<PeriodoContexto> {
    const rows = await this.dataSource.query(
      `SELECT pc.id_periodo_carrera,
              pc.id_periodo,
              pc.id_carrera,
              pc.estado AS estado_periodo_carrera,
              m.id_estudiante,
              pa.codigo AS codigo_periodo
       FROM matricula_detalle md
       JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
       JOIN periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
       JOIN periodo_academico pa ON pa.id_periodo = pc.id_periodo
       JOIN matricula m ON m.id_matricula = md.id_matricula
       WHERE md.id_matricula_detalle = $1
       LIMIT 1`,
      [idMatriculaDetalle],
    );

    if (rows.length === 0) {
      throw new NotFoundException('No se encontró el contexto académico para la matrícula detalle.');
    }

    return rows[0] as PeriodoContexto;
  }

  async obtenerContextoDesdePractica(idPractica: number): Promise<PeriodoContexto> {
    const rows = await this.dataSource.query(
      `SELECT pc.id_periodo_carrera,
              pc.id_periodo,
              pc.id_carrera,
              pc.estado AS estado_periodo_carrera,
              m.id_estudiante,
              pa.codigo AS codigo_periodo
       FROM practica_estudiante p
       JOIN matricula_detalle md ON md.id_matricula_detalle = p.id_matricula_detalle
       JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
       JOIN periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
       JOIN periodo_academico pa ON pa.id_periodo = pc.id_periodo
       JOIN matricula m ON m.id_matricula = md.id_matricula
       WHERE p.id_practica = $1
       LIMIT 1`,
      [idPractica],
    );

    if (rows.length === 0) {
      throw new NotFoundException('No se encontró el contexto académico para la práctica.');
    }

    return rows[0] as PeriodoContexto;
  }

  async validarPeriodoActivo(idMatriculaDetalle: number): Promise<PeriodoContexto> {
    const contexto = await this.obtenerContextoDesdeMatriculaDetalle(idMatriculaDetalle);
    await this.asegurarActivo(contexto);
    return contexto;
  }

  async validarPeriodoActivoDesdePractica(idPractica: number): Promise<PeriodoContexto> {
    const contexto = await this.obtenerContextoDesdePractica(idPractica);
    await this.asegurarActivo(contexto);
    return contexto;
  }

  async asegurarActivo(contexto: PeriodoContexto): Promise<void> {
    if (contexto.estado_periodo_carrera !== 'ACTIVO') {
      throw new ConflictException('El período académico se encuentra finalizado y es de solo consulta.');
    }
  }

  async esActivo(idMatriculaDetalle: number): Promise<boolean> {
    const contexto = await this.obtenerContextoDesdeMatriculaDetalle(idMatriculaDetalle);
    return contexto.estado_periodo_carrera === 'ACTIVO';
  }

  async esActivoDesdePractica(idPractica: number): Promise<boolean> {
    const contexto = await this.obtenerContextoDesdePractica(idPractica);
    return contexto.estado_periodo_carrera === 'ACTIVO';
  }
}
