import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PortafolioReporteNotas } from '../domain/reporte-notas.entity';
import { PortafolioAceptacionEstudiante } from '../domain/aceptacion-estudiante.entity';
import { IAceptacionNotasRepository } from '../ports/aceptacion-notas.repository';
import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';
import { ReporteNotasResponseDto } from '../dto/reporte-notas-response.dto';
import { NotaEstudianteDto } from '../dto/update-notas-aceptacion.dto';

@Injectable()
export class AceptacionNotasPg implements IAceptacionNotasRepository {
  constructor(
    @InjectRepository(PortafolioReporteNotas)
    private readonly reporteRepo: Repository<PortafolioReporteNotas>,
    private readonly dataSource: DataSource,
  ) {}

  async existsByOfertaAndTipo(idOfertaAsignatura: number, tipoReporte: string): Promise<boolean> {
    const count = await this.reporteRepo.count({
      where: { idOfertaAsignatura, tipoReporte },
    });
    return count > 0;
  }

  async generarReporte(dto: CreateReporteNotasDto): Promise<ReporteNotasResponseDto> {
    await this.dataSource.transaction(async (manager) => {
      const reporte = manager.create(PortafolioReporteNotas, {
        idPeriodo: dto.id_periodo,
        idOfertaAsignatura: dto.id_oferta_asignatura,
        tipoReporte: dto.tipo_reporte,
      });
      const reporteGuardado = await manager.save(reporte);

      const estudiantes: { id_matricula_detalle: number }[] = await manager.query(
        `
        SELECT id_matricula_detalle
        FROM matricula_detalle
        WHERE id_oferta_asignatura = $1
        `,
        [dto.id_oferta_asignatura],
      );

      if (estudiantes.length) {
        const detalles = estudiantes.map((fila) =>
          manager.create(PortafolioAceptacionEstudiante, {
            idReporteNotas: reporteGuardado.idReporteNotas,
            idMatriculaDetalle: fila.id_matricula_detalle,
            notaRegistrada: null,
          }),
        );
        await manager.save(detalles);
      }
    });

    const reporteCreado = await this.findByOfertaAndTipo(dto.id_oferta_asignatura, dto.tipo_reporte);
    return reporteCreado!;
  }

  async actualizarNotas(idReporteNotas: number, estudiantes: NotaEstudianteDto[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const est of estudiantes) {
        const resultado = await manager.query(
          `
          UPDATE portafolio_aceptacion_estudiante
          SET nota_registrada = $1
          WHERE id_aceptacion = $2 AND id_reporte_notas = $3
          RETURNING id_aceptacion
          `,
          [est.nota, est.id_aceptacion, idReporteNotas],
        );

        if (!resultado.length) {
          throw new NotFoundException(
            `El estudiante con id_aceptacion=${est.id_aceptacion} no pertenece a este reporte`,
          );
        }
      }
    });
  }

  async findByOfertaAndTipo(
    idOfertaAsignatura: number,
    tipoReporte: string,
  ): Promise<ReporteNotasResponseDto | null> {
    const cabecera = await this.dataSource.query(
      `
      SELECT
        prn.id_reporte_notas,
        prn.tipo_reporte,
        prn.fecha_generacion,
        c.nombre  AS carrera,
        n.nombre  AS nivel,
        a.nombre  AS asignatura,
        p.nombre  AS paralelo,
        j.nombre  AS jornada,
        d.nombres || ' ' || d.apellidos AS docente,
        pa.nombre AS periodo,
        co.nombres || ' ' || co.apellidos AS coordinador
      FROM portafolio_reporte_notas prn
      JOIN oferta_asignatura oa ON prn.id_oferta_asignatura = oa.id_oferta_asignatura
      JOIN asignatura a         ON oa.id_asignatura = a.id_asignatura
      JOIN nivel n              ON a.id_nivel = n.id_nivel
      JOIN carrera c            ON n.id_carrera = c.id_carrera
      JOIN paralelo p           ON oa.id_paralelo = p.id_paralelo
      JOIN jornada j            ON oa.id_jornada = j.id_jornada
      JOIN docente d            ON oa.id_docente = d.id_docente
      JOIN periodo_academico pa ON prn.id_periodo = pa.id_periodo
      LEFT JOIN periodo_carrera pc ON pc.id_periodo = prn.id_periodo AND pc.id_carrera = c.id_carrera
      LEFT JOIN docente co         ON pc.id_coordinador = co.id_docente
      WHERE prn.id_oferta_asignatura = $1 AND prn.tipo_reporte = $2
      `,
      [idOfertaAsignatura, tipoReporte],
    );

    if (!cabecera.length) return null;

    const estudiantes = await this.dataSource.query(
      `
      SELECT
        pae.id_aceptacion,
        e.cedula,
        e.nombres || ' ' || e.apellidos AS estudiante,
        pae.nota_registrada,
        pae.estado_aceptacion,
        pae.fecha_aceptacion
      FROM portafolio_aceptacion_estudiante pae
      JOIN portafolio_reporte_notas prn ON pae.id_reporte_notas = prn.id_reporte_notas
      JOIN matricula_detalle md ON pae.id_matricula_detalle = md.id_matricula_detalle
      JOIN matricula m          ON md.id_matricula = m.id_matricula
      JOIN estudiante e         ON m.id_estudiante = e.id_estudiante
      WHERE prn.id_oferta_asignatura = $1 AND prn.tipo_reporte = $2
      ORDER BY e.apellidos, e.nombres
      `,
      [idOfertaAsignatura, tipoReporte],
    );

    const row = cabecera[0];
    return {
      reporte: {
        id_reporte_notas: row.id_reporte_notas,
        carrera: row.carrera,
        nivel: row.nivel,
        asignatura: row.asignatura,
        paralelo: row.paralelo,
        jornada: row.jornada,
        docente: row.docente,
        coordinador: row.coordinador,
        periodo: row.periodo,
        tipo_reporte: row.tipo_reporte,
        fecha_generacion: row.fecha_generacion,
      },
      estudiantes: estudiantes.map(
        (fila: {
          id_aceptacion: number;
          cedula: string;
          estudiante: string;
          nota_registrada: number | null;
          estado_aceptacion: string;
          fecha_aceptacion: Date | null;
        }) => ({
          id_aceptacion: fila.id_aceptacion,
          cedula: fila.cedula,
          estudiante: fila.estudiante,
          nota_registrada: fila.nota_registrada,
          estado_aceptacion: fila.estado_aceptacion,
          fecha_aceptacion: fila.fecha_aceptacion,
        }),
      ),
    };
  }
}
