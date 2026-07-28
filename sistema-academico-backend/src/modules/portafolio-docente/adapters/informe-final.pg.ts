import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByDocenteAndOferta(
    idDocente: number,
    idOfertaAsignatura: number,
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
        pif.fecha_firma_coordinador,
        co.nombres || ' ' || co.apellidos AS nombre_coordinador
      FROM portafolio_informe_final pif
      JOIN oferta_asignatura oa ON pif.id_oferta_asignatura = oa.id_oferta_asignatura
      JOIN docente           d  ON oa.id_docente         = d.id_docente
      JOIN asignatura        a  ON oa.id_asignatura       = a.id_asignatura
      JOIN paralelo          p  ON oa.id_paralelo         = p.id_paralelo
      JOIN periodo_carrera   pc ON oa.id_periodo_carrera  = pc.id_periodo_carrera
      JOIN periodo_academico pa ON pc.id_periodo          = pa.id_periodo
      LEFT JOIN docente      co ON pc.id_coordinador      = co.id_docente
      WHERE pif.id_oferta_asignatura = $1 AND oa.id_docente = $2
      `,
      [idOfertaAsignatura, idDocente],
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
        coordinador:              row.nombre_coordinador,
        fecha_firma_docente:      row.fecha_firma_docente,
        fecha_firma_coordinador:  row.fecha_firma_coordinador,
      },
    };
  }

  async create(dto: CreateInformeFinalDto): Promise<PortafolioInformeFinal> {
    const oferta = await this.dataSource.query(
      `
      SELECT oa.id_oferta_asignatura
      FROM oferta_asignatura oa
      JOIN periodo_carrera pc ON oa.id_periodo_carrera = pc.id_periodo_carrera
      WHERE oa.id_docente = $1 AND oa.id_asignatura = $2
        AND oa.id_paralelo = $3 AND pc.id_periodo = $4
      `,
      [dto.id_docente, dto.id_asignatura, dto.id_paralelo, dto.id_periodo],
    );

    if (!oferta.length) {
      throw new NotFoundException(
        'No existe una oferta académica para ese docente, asignatura, paralelo y período',
      );
    }

    const informe = this.repo.create({
      idOfertaAsignatura: oferta[0].id_oferta_asignatura,
      horario: dto.horario,
    });
    return this.repo.save(informe);
  }
}
