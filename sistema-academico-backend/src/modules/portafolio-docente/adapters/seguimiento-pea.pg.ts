import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PortafolioSeguimientoPea } from '../domain/seguimiento-pea.entity';
import { ISeguimientoPeaRepository } from '../ports/seguimiento-pea.repository';
import { CreateSeguimientoPeaDto } from '../dto/create-seguimiento-pea.dto';
import { SeguimientoPeaResponseDto } from '../dto/seguimiento-pea-response.dto';

@Injectable()
export class SeguimientoPeaPg implements ISeguimientoPeaRepository {
  constructor(
    @InjectRepository(PortafolioSeguimientoPea)
    private readonly repo: Repository<PortafolioSeguimientoPea>,
    private readonly dataSource: DataSource,
  ) {}

  async existsByOferta(idOfertaAsignatura: number): Promise<boolean> {
    const count = await this.repo.count({ where: { idOfertaAsignatura } });
    return count > 0;
  }

  async create(dto: CreateSeguimientoPeaDto, idDocente: number): Promise<SeguimientoPeaResponseDto> {
    await this.verificarOfertaDelDocente(dto.id_oferta_asignatura, idDocente);
    await this.verificarRepresentanteMatriculado(dto.id_oferta_asignatura, dto.id_representante);

    await this.repo.save(
      this.repo.create({
        idOfertaAsignatura: dto.id_oferta_asignatura,
        idRepresentante: dto.id_representante,
      }),
    );

    const creado = await this.findByOferta(dto.id_oferta_asignatura, idDocente);
    return creado!;
  }

  async updateRepresentante(idSeguimientoPea: number, idDocente: number, idRepresentante: number): Promise<void> {
    const seguimiento = await this.repo.findOneBy({ idSeguimientoPea });
    if (!seguimiento) {
      throw new NotFoundException(`No existe el seguimiento PEA con id ${idSeguimientoPea}`);
    }

    await this.verificarOfertaDelDocente(seguimiento.idOfertaAsignatura, idDocente, idSeguimientoPea);
    await this.verificarRepresentanteMatriculado(seguimiento.idOfertaAsignatura, idRepresentante);

    await this.repo.update({ idSeguimientoPea }, { idRepresentante });
  }

  async findByOferta(idOfertaAsignatura: number, idDocente: number): Promise<SeguimientoPeaResponseDto | null> {
    const result = await this.dataSource.query(
      `
      SELECT
        psp.id_seguimiento_pea,
        c.nombre  AS carrera,
        a.nombre  AS asignatura,
        p.nombre  AS paralelo,
        pa.nombre AS periodo,
        d.nombres || ' ' || d.apellidos AS docente,
        e.id_estudiante,
        e.nombres || ' ' || e.apellidos AS representante_nombre,
        e.telefono,
        e.correo AS email
      FROM portafolio_seguimiento_pea psp
      JOIN oferta_asignatura oa ON psp.id_oferta_asignatura = oa.id_oferta_asignatura
      JOIN asignatura a         ON oa.id_asignatura = a.id_asignatura
      JOIN nivel n              ON a.id_nivel = n.id_nivel
      JOIN carrera c            ON n.id_carrera = c.id_carrera
      JOIN paralelo p           ON oa.id_paralelo = p.id_paralelo
      JOIN periodo_carrera pc   ON oa.id_periodo_carrera = pc.id_periodo_carrera
      JOIN periodo_academico pa ON pc.id_periodo = pa.id_periodo
      JOIN docente d            ON oa.id_docente = d.id_docente
      LEFT JOIN estudiante e    ON psp.id_representante = e.id_estudiante
      WHERE psp.id_oferta_asignatura = $1 AND oa.id_docente = $2
      `,
      [idOfertaAsignatura, idDocente],
    );

    if (!result.length) return null;

    const row = result[0];
    return {
      id_seguimiento_pea: row.id_seguimiento_pea,
      informe: {
        carrera: row.carrera,
        asignatura: row.asignatura,
        paralelo: row.paralelo,
        periodo: row.periodo,
        docente: row.docente,
      },
      representante: {
        id_estudiante: row.id_estudiante,
        nombre: row.representante_nombre,
        telefono: row.telefono,
        email: row.email,
      },
    };
  }

  private async verificarOfertaDelDocente(
    idOfertaAsignatura: number,
    idDocente: number,
    idSeguimientoPea?: number,
  ): Promise<void> {
    const pertenece = await this.dataSource.query(
      `SELECT 1 FROM oferta_asignatura WHERE id_oferta_asignatura = $1 AND id_docente = $2`,
      [idOfertaAsignatura, idDocente],
    );

    if (!pertenece.length) {
      throw new NotFoundException(
        idSeguimientoPea
          ? `No existe el seguimiento PEA con id ${idSeguimientoPea} para este docente`
          : 'La oferta académica no existe o no pertenece a este docente',
      );
    }
  }

  private async verificarRepresentanteMatriculado(
    idOfertaAsignatura: number,
    idRepresentante: number,
  ): Promise<void> {
    const matriculado = await this.dataSource.query(
      `
      SELECT 1
      FROM matricula_detalle md
      JOIN matricula m ON md.id_matricula = m.id_matricula
      WHERE md.id_oferta_asignatura = $1 AND m.id_estudiante = $2
      `,
      [idOfertaAsignatura, idRepresentante],
    );

    if (!matriculado.length) {
      throw new NotFoundException(
        'El estudiante seleccionado no está matriculado en esta oferta académica',
      );
    }
  }
}
