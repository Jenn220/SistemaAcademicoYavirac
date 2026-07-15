import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PortafolioInformeFinal } from '../domain/informe-final.entity';
import { IInformeFinalRepository } from '../ports/informe-final.repository';
import { CreateInformeFinalDto } from '../dto/create-informe-final.dto';
import { InformeFinalResponseDto } from '../dto/informe-final-response.dto';

@Injectable()
export class InformeFinalPg implements IInformeFinalRepository {
  constructor(
    @InjectRepository(PortafolioInformeFinal)
    private readonly repo: Repository<PortafolioInformeFinal>,
    private readonly dataSource: DataSource,
  ) {}

  async findByDocenteAndPeriodo(
    idDocente: number,
    idPeriodo: number,
  ): Promise<InformeFinalResponseDto | null> {
    const result = await this.dataSource.query(
      `
      SELECT
        d.nombres || ' ' || d.apellidos AS nombre_docente,
        a.nombre                        AS nombre_asignatura,
        p.nombre                        AS paralelo,
        pif.horario,
        pa.nombre                       AS periodo,
        pif.fecha_firma_docente,
        pif.fecha_firma_coordinador
      FROM portafolio_informe_final pif
      JOIN docente           d  ON pif.id_docente    = d.id_docente
      JOIN asignatura        a  ON pif.id_asignatura = a.id_asignatura
      JOIN paralelo          p  ON pif.id_paralelo   = p.id_paralelo
      JOIN periodo_academico pa ON pif.id_periodo    = pa.id_periodo
      WHERE pif.id_docente = $1 AND pif.id_periodo = $2
      `,
      [idDocente, idPeriodo],
    );

    if (!result.length) return null;

    const row = result[0];
    return {
      informe: {
        nombre_docente:    row.nombre_docente,
        nombre_asignatura: row.nombre_asignatura,
        paralelo:          row.paralelo,
        horario:           row.horario,
        periodo:           row.periodo,
      },
      firmas: {
        docente:                  row.nombre_docente,
        fecha_firma_docente:      row.fecha_firma_docente,
        fecha_firma_coordinador:  row.fecha_firma_coordinador,
      },
    };
  }

  async create(dto: CreateInformeFinalDto): Promise<PortafolioInformeFinal> {
    const informe = this.repo.create({
      idDocente:    dto.id_docente,
      idPeriodo:    dto.id_periodo,
      idAsignatura: dto.id_asignatura,
      idParalelo:   dto.id_paralelo,
      horario:      dto.horario,
    });
    return this.repo.save(informe);
  }
}
