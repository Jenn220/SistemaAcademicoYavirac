import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import {
  DataSource,
  EntityManager,
} from 'typeorm';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { CerrarPeriodoDto } from './dto/cerrar-periodo.dto';
import { ConsultarPeriodosDto } from './dto/consultar-periodos.dto';
import { CrearPeriodoCarreraDto } from './dto/crear-periodo-carrera.dto';
import { ReasignarCoordinadorDto } from './dto/reasignar-coordinador.dto';

interface PeriodoCarreraDb {
  id_periodo_carrera: number;
  id_periodo: number;
  id_carrera: number;
  estado: string;
  id_coordinador: number | null;
}

interface ResumenCierreDb {
  idPeriodoCarrera: number;

  totalOfertas: number;
  totalMatriculasDetalle: number;
  totalVinculaciones: number;
  totalPracticas: number;

  matriculasDetallePendientes: number;
  vinculacionesPendientes: number;
  practicasPendientes: number;
}

interface ResumenCierreRespuesta
  extends ResumenCierreDb {
  puedeCerrar: boolean;
  bloqueos: string[];
}

interface CoordinadorDb {
  idDocente: number;
  nombre: string;
  correo?: string | null;
}

@Injectable()
export class ControlPeriodosService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  /*
   * ============================================================
   * CATÁLOGOS PARA CREACIÓN
   * ============================================================
   */

  async obtenerCatalogosCreacion(
    usuario: JwtPayload,
  ) {
    this.obtenerIdDocente(usuario);

    const carreras =
      await this.dataSource.query(
        `
        SELECT
          c.id_carrera AS "idCarrera",
          c.nombre
        FROM carrera c
        ORDER BY c.nombre ASC
        `,
      );

    const coordinadores =
      await this.dataSource.query(
        `
        SELECT DISTINCT
          d.id_docente AS "idDocente",

          CONCAT(
            d.nombres,
            ' ',
            d.apellidos
          ) AS nombre,

          d.correo

        FROM docente d

        INNER JOIN usuario u
          ON u.id_docente = d.id_docente

        INNER JOIN usuario_rol ur
          ON ur.id_usuario = u.id_usuario

        INNER JOIN rol r
          ON r.id_rol = ur.id_rol

        WHERE
          d.estado = 'ACTIVO'
          AND u.estado = 'ACTIVO'
          AND u.bloqueado = false
          AND r.nombre = 'COORDINADOR'

        ORDER BY nombre ASC
        `,
      );

    return {
      carreras,
      coordinadores,

      periodosPermitidos: [
        {
          valor: '1P',
          nombre: 'Primer período',
        },
        {
          valor: '2P',
          nombre: 'Segundo período',
        },
      ],
    };
  }

  /*
   * ============================================================
   * CREAR PERÍODO-CARRERA
   * ============================================================
   */

  async crearPeriodoCarrera(
    usuario: JwtPayload,
    dto: CrearPeriodoCarreraDto,
  ) {
    this.obtenerIdDocente(usuario);

    const codigoPeriodo =
      `${dto.anio}-${dto.numeroPeriodo}`.toUpperCase();

    if (
      !/^\d{4}-(1P|2P)$/.test(
        codigoPeriodo,
      )
    ) {
      throw new UnprocessableEntityException(
        'El código del período debe tener el formato AAAA-1P o AAAA-2P.',
      );
    }

    this.validarFechasCreacion(dto);

    return this.dataSource.transaction(
      async (manager) => {
        /*
         * Validar carrera.
         */

        const carreras =
          await manager.query(
            `
            SELECT
              id_carrera,
              nombre
            FROM carrera
            WHERE id_carrera = $1
            `,
            [dto.idCarrera],
          );

        const carrera =
          carreras[0];

        if (!carrera) {
          throw new NotFoundException(
            'La carrera seleccionada no existe.',
          );
        }

        /*
         * Validar coordinador.
         */

        const coordinadores =
          await manager.query(
            `
            SELECT DISTINCT
              d.id_docente
                AS "idDocente",

              CONCAT(
                d.nombres,
                ' ',
                d.apellidos
              ) AS nombre,

              d.correo

            FROM docente d

            INNER JOIN usuario u
              ON u.id_docente =
                d.id_docente

            INNER JOIN usuario_rol ur
              ON ur.id_usuario =
                u.id_usuario

            INNER JOIN rol r
              ON r.id_rol =
                ur.id_rol

            WHERE
              d.id_docente = $1
              AND d.estado = 'ACTIVO'
              AND u.estado = 'ACTIVO'
              AND u.bloqueado = false
              AND r.nombre = 'COORDINADOR'
            `,
            [dto.idCoordinador],
          );

        const coordinador =
          coordinadores[0];

        if (!coordinador) {
          throw new UnprocessableEntityException(
            'El docente seleccionado no es un coordinador activo válido.',
          );
        }

        /*
         * Buscar período académico existente.
         */

        const periodosExistentes =
          await manager.query(
            `
            SELECT
              id_periodo,
              codigo,
              nombre,
              fecha_inicio,
              fecha_fin,
              estado

            FROM periodo_academico

            WHERE
              UPPER(codigo) =
                UPPER($1)

            FOR UPDATE
            `,
            [codigoPeriodo],
          );

        let idPeriodo: number;

        if (
          periodosExistentes.length > 0
        ) {
          const periodoExistente =
            periodosExistentes[0];

          const fechaInicioExistente =
            this.normalizarFecha(
              periodoExistente
                .fecha_inicio,
            );

          const fechaFinExistente =
            this.normalizarFecha(
              periodoExistente
                .fecha_fin,
            );

          if (
            fechaInicioExistente !==
              dto.fechaInicio ||
            fechaFinExistente !==
              dto.fechaFin
          ) {
            throw new ConflictException(
              `El período ${codigoPeriodo} ya existe con un rango de fechas diferente.`,
            );
          }

          idPeriodo =
            Number(
              periodoExistente.id_periodo,
            );
        } else {
          const nombrePeriodo =
            dto.nombrePeriodo?.trim() ||
            (
              dto.numeroPeriodo === '1P'
                ? `Primer período académico ${dto.anio}`
                : `Segundo período académico ${dto.anio}`
            );

          const periodoCreado =
            await manager.query(
              `
              INSERT INTO periodo_academico (
                codigo,
                nombre,
                fecha_inicio,
                fecha_fin,
                estado
              )
              VALUES (
                $1,
                $2,
                $3,
                $4,
                'ACTIVO'
              )
              RETURNING
                id_periodo
              `,
              [
                codigoPeriodo,
                nombrePeriodo,
                dto.fechaInicio,
                dto.fechaFin,
              ],
            );

          idPeriodo =
            Number(
              periodoCreado[0]
                .id_periodo,
            );
        }

        /*
         * Validar combinación período + carrera.
         */

        const asociaciones =
          await manager.query(
            `
            SELECT
              pc.id_periodo_carrera
                AS "idPeriodoCarrera",

              pc.id_coordinador
                AS "idCoordinador",

              CASE
                WHEN d.id_docente IS NULL
                  THEN NULL
                ELSE CONCAT(
                  d.nombres,
                  ' ',
                  d.apellidos
                )
              END
                AS "nombreCoordinador",

              d.correo
                AS "correoCoordinador"

            FROM periodo_carrera pc

            LEFT JOIN docente d
              ON d.id_docente =
                pc.id_coordinador

            WHERE
              pc.id_periodo = $1
              AND pc.id_carrera = $2

            LIMIT 1
            `,
            [
              idPeriodo,
              dto.idCarrera,
            ],
          );

        if (
          asociaciones.length > 0
        ) {
          const asociacion =
            asociaciones[0];

          const nombreCoordinador =
            asociacion.nombreCoordinador ??
            'un coordinador';

          const correoCoordinador =
            asociacion.correoCoordinador
              ? ` (${asociacion.correoCoordinador})`
              : '';

          throw new ConflictException(
            `El período ${codigoPeriodo} para la carrera ${carrera.nombre} ya existe y está asignado al coordinador ${nombreCoordinador}${correoCoordinador}.`,
          );
        }


        /*
         * Crear periodo_carrera.
         */

        const resultado =
          await manager.query(
            `
            INSERT INTO periodo_carrera (
              id_periodo,
              id_carrera,

              fecha_inicio,
              fecha_fin,

              fecha_inicio_aporte1,
              fecha_fin_aporte1,

              fecha_inicio_aporte2,
              fecha_fin_aporte2,

              fecha_inicio_supletorio,
              fecha_fin_supletorio,

              fecha_inicio_fase_teorica,
              fecha_fin_fase_teorica,

              fecha_inicio_fase_practica,
              fecha_fin_fase_practica,

              estado,
              id_coordinador
            )
            VALUES (
              $1,
              $2,

              $3,
              $4,

              $5,
              $6,

              $7,
              $8,

              $9,
              $10,

              $11,
              $12,

              $13,
              $14,

              'ACTIVO',
              $15
            )

            RETURNING
              id_periodo_carrera
                AS "idPeriodoCarrera",

              estado
            `,
            [
              idPeriodo,
              dto.idCarrera,

              dto.fechaInicio,
              dto.fechaFin,

              dto.fechaInicioAporte1 ??
                null,

              dto.fechaFinAporte1 ??
                null,

              dto.fechaInicioAporte2 ??
                null,

              dto.fechaFinAporte2 ??
                null,

              dto.fechaInicioSupletorio ??
                null,

              dto.fechaFinSupletorio ??
                null,

              dto.fechaInicioFaseTeorica ??
                null,

              dto.fechaFinFaseTeorica ??
                null,

              dto.fechaInicioFasePractica ??
                null,

              dto.fechaFinFasePractica ??
                null,

              dto.idCoordinador,
            ],
          );

        const periodoCarrera =
          resultado[0];

        return {
          ok: true,

          mensaje:
            'El período-carrera fue creado correctamente.',

          idPeriodo,

          idPeriodoCarrera:
            Number(
              periodoCarrera
                .idPeriodoCarrera,
            ),

          codigoPeriodo,

          numeroPeriodo:
            dto.numeroPeriodo,

          anio:
            dto.anio,

          idCarrera:
            Number(dto.idCarrera),

          nombreCarrera:
            carrera.nombre,

          idCoordinador:
            Number(
              dto.idCoordinador,
            ),

          nombreCoordinador:
            coordinador.nombre,

          fechaInicio:
            dto.fechaInicio,

          fechaFin:
            dto.fechaFin,

          estado:
            periodoCarrera.estado,
        };
      },
    );
  }

  /*
   * ============================================================
   * LISTADO DEL COORDINADOR
   * ============================================================
   */

  async obtenerPeriodosDelCoordinador(
    usuario: JwtPayload,
    filtros: ConsultarPeriodosDto,
  ) {
    const idDocente =
      this.obtenerIdDocente(usuario);

    const parametros: unknown[] = [
      idDocente,
    ];

    const condiciones: string[] = [
      'pc.id_coordinador = $1',
    ];

    if (filtros.idPeriodo) {
      parametros.push(
        filtros.idPeriodo,
      );

      condiciones.push(
        `pc.id_periodo = $${parametros.length}`,
      );
    }

    if (filtros.idCarrera) {
      parametros.push(
        filtros.idCarrera,
      );

      condiciones.push(
        `pc.id_carrera = $${parametros.length}`,
      );
    }

    if (filtros.estado) {
      parametros.push(
        filtros.estado,
      );

      condiciones.push(
        `pc.estado = $${parametros.length}`,
      );
    }

    return this.dataSource.query(
      `
      SELECT
        pc.id_periodo_carrera
          AS "idPeriodoCarrera",

        pc.id_periodo
          AS "idPeriodo",

        pc.id_carrera
          AS "idCarrera",

        c.nombre
          AS "nombreCarrera",

        pa.codigo
          AS "codigoPeriodo",

        pc.fecha_inicio
          AS "fechaInicio",

        pc.fecha_fin
          AS "fechaFin",

        pc.fecha_fin_supletorio
          AS "fechaFinSupletorio",

        pc.estado,

        pc.fecha_cierre
          AS "fechaCierre",

        pc.id_coordinador
          AS "idCoordinador",

        CASE
          WHEN d.id_docente IS NULL
            THEN NULL
          ELSE CONCAT(
            d.nombres,
            ' ',
            d.apellidos
          )
        END AS "nombreCoordinador"

      FROM periodo_carrera pc

      INNER JOIN carrera c
        ON c.id_carrera =
          pc.id_carrera

      INNER JOIN periodo_academico pa
        ON pa.id_periodo =
          pc.id_periodo

      LEFT JOIN docente d
        ON d.id_docente =
          pc.id_coordinador

      WHERE
        ${condiciones.join(
          ' AND ',
        )}

      ORDER BY
        pc.fecha_inicio DESC,
        c.nombre ASC
      `,
      parametros,
    );
  }

  /*
   * ============================================================
   * RESUMEN DE CIERRE
   * ============================================================
   */

  async obtenerResumenCierre(
    idPeriodoCarrera: number,
    usuario: JwtPayload,
  ): Promise<ResumenCierreRespuesta> {
    const idDocente =
      this.obtenerIdDocente(usuario);

    await this.validarCoordinadorAsignado(
      this.dataSource.manager,
      idPeriodoCarrera,
      idDocente,
    );

    const resumen =
      await this.consultarResumenCierre(
        this.dataSource.manager,
        idPeriodoCarrera,
      );

    return this.construirResumen(
      resumen,
    );
  }

  /*
   * ============================================================
   * COORDINADORES DISPONIBLES
   * ============================================================
   */

  async obtenerCoordinadoresDisponibles(
    idPeriodoCarrera: number,
    usuario: JwtPayload,
  ): Promise<CoordinadorDb[]> {
    const idDocenteActual =
      this.obtenerIdDocente(usuario);

    const periodo =
      await this.validarCoordinadorAsignado(
        this.dataSource.manager,
        idPeriodoCarrera,
        idDocenteActual,
      );

    return this.dataSource.query(
      `
      SELECT DISTINCT
        d.id_docente
          AS "idDocente",

        CONCAT(
          d.nombres,
          ' ',
          d.apellidos
        ) AS nombre,

        d.correo

      FROM docente d

      INNER JOIN usuario u
        ON u.id_docente =
          d.id_docente

      INNER JOIN usuario_rol ur
        ON ur.id_usuario =
          u.id_usuario

      INNER JOIN rol r
        ON r.id_rol =
          ur.id_rol

      WHERE
        d.estado = 'ACTIVO'
        AND u.estado = 'ACTIVO'
        AND u.bloqueado = false
        AND r.nombre = 'COORDINADOR'
        AND d.id_docente <> $2

        AND (
          EXISTS (
            SELECT 1

            FROM periodo_carrera pc2

            WHERE
              pc2.id_carrera = $1
              AND pc2.id_coordinador =
                d.id_docente
          )

          OR EXISTS (
            SELECT 1

            FROM oferta_asignatura oa2

            INNER JOIN periodo_carrera pc3
              ON pc3.id_periodo_carrera =
                oa2.id_periodo_carrera

            WHERE
              pc3.id_carrera = $1
              AND oa2.id_docente =
                d.id_docente
          )
        )

      ORDER BY nombre ASC
      `,
      [
        periodo.id_carrera,
        idDocenteActual,
      ],
    );
  }

  /*
   * ============================================================
   * CERRAR PERÍODO
   * ============================================================
   */

  async cerrarPeriodo(
    idPeriodoCarrera: number,
    usuario: JwtPayload,
    dto: CerrarPeriodoDto,
  ) {
    const idDocente =
      this.obtenerIdDocente(usuario);

    const idUsuario =
      this.obtenerIdUsuario(usuario);

    return this.dataSource.transaction(
      async (manager) => {
        const periodo =
          await this.obtenerPeriodoParaActualizar(
            manager,
            idPeriodoCarrera,
          );

        this.validarPropietarioPeriodo(
          periodo,
          idDocente,
        );

        if (
          periodo.estado ===
          'FINALIZADO'
        ) {
          throw new ConflictException(
            'El período académico ya fue cerrado.',
          );
        }

        if (
          periodo.estado !==
          'ACTIVO'
        ) {
          throw new ConflictException(
            `No se puede cerrar un período en estado ${periodo.estado}.`,
          );
        }

        const resumen =
          await this.consultarResumenCierre(
            manager,
            idPeriodoCarrera,
          );

        const resumenProcesado =
          this.construirResumen(
            resumen,
          );

        if (
          !resumenProcesado.puedeCerrar
        ) {
          throw new UnprocessableEntityException({
            message:
              'El período tiene registros académicos pendientes.',

            bloqueos:
              resumenProcesado.bloqueos,
          });
        }

        await manager.query(
          `
          UPDATE periodo_carrera

          SET
            estado = 'FINALIZADO',
            fecha_cierre =
              CURRENT_TIMESTAMP,
            id_usuario_cierre = $2

          WHERE
            id_periodo_carrera = $1
          `,
          [
            idPeriodoCarrera,
            idUsuario,
          ],
        );

        await manager.query(
          `
          INSERT INTO periodo_carrera_historial (
            id_periodo_carrera,
            tipo_accion,
            estado_anterior,
            estado_nuevo,
            id_coordinador_anterior,
            id_coordinador_nuevo,
            id_usuario_ejecutor,
            motivo
          )
          VALUES (
            $1,
            'CIERRE',
            $2,
            'FINALIZADO',
            $3,
            $3,
            $4,
            $5
          )
          `,
          [
            idPeriodoCarrera,
            periodo.estado,
            periodo.id_coordinador,
            idUsuario,
            dto.motivo ?? null,
          ],
        );

        const resultados =
          await manager.query(
            `
            SELECT
              id_periodo_carrera
                AS "idPeriodoCarrera",

              estado,

              fecha_cierre
                AS "fechaCierre"

            FROM periodo_carrera

            WHERE
              id_periodo_carrera = $1
            `,
            [idPeriodoCarrera],
          );

        const resultado =
          resultados[0];

        return {
          ok: true,

          mensaje:
            'El período académico fue cerrado correctamente.',

          idPeriodoCarrera:
            resultado.idPeriodoCarrera,

          estado:
            resultado.estado,

          fechaCierre:
            resultado.fechaCierre,
        };
      },
    );
  }

  /*
   * ============================================================
   * REASIGNAR COORDINADOR
   * ============================================================
   */

  async reasignarCoordinador(
    idPeriodoCarrera: number,
    usuario: JwtPayload,
    dto: ReasignarCoordinadorDto,
  ) {
    const idDocenteActual =
      this.obtenerIdDocente(usuario);

    const idUsuario =
      this.obtenerIdUsuario(usuario);

    return this.dataSource.transaction(
      async (manager) => {
        const periodo =
          await this.obtenerPeriodoParaActualizar(
            manager,
            idPeriodoCarrera,
          );

        this.validarPropietarioPeriodo(
          periodo,
          idDocenteActual,
        );

        if (
          periodo.estado !==
          'ACTIVO'
        ) {
          throw new ConflictException(
            'Solo se puede cambiar el coordinador de un período activo.',
          );
        }

        const idNuevoCoordinador =
          Number(
            dto.idNuevoCoordinador,
          );

        if (
          idNuevoCoordinador ===
          idDocenteActual
        ) {
          throw new ConflictException(
            'El docente seleccionado ya es el coordinador del período.',
          );
        }

        const nuevoCoordinador =
          await this.validarNuevoCoordinador(
            manager,
            periodo.id_carrera,
            idNuevoCoordinador,
          );

        await manager.query(
          `
          UPDATE periodo_carrera

          SET
            id_coordinador = $2

          WHERE
            id_periodo_carrera = $1
          `,
          [
            idPeriodoCarrera,
            idNuevoCoordinador,
          ],
        );

        await manager.query(
          `
          INSERT INTO periodo_carrera_historial (
            id_periodo_carrera,
            tipo_accion,
            estado_anterior,
            estado_nuevo,
            id_coordinador_anterior,
            id_coordinador_nuevo,
            id_usuario_ejecutor,
            motivo
          )
          VALUES (
            $1,
            'REASIGNACION_COORDINADOR',
            $2,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          `,
          [
            idPeriodoCarrera,
            periodo.estado,
            idDocenteActual,
            idNuevoCoordinador,
            idUsuario,
            dto.motivo ?? null,
          ],
        );

        return {
          ok: true,

          mensaje:
            'El coordinador fue cambiado correctamente.',

          idPeriodoCarrera,

          idCoordinadorAnterior:
            idDocenteActual,

          idNuevoCoordinador,

          nombreNuevoCoordinador:
            nuevoCoordinador.nombre,
        };
      },
    );
  }

  /*
   * ============================================================
   * HISTORIAL
   * ============================================================
   */

  async obtenerHistorial(
    idPeriodoCarrera: number,
    usuario: JwtPayload,
  ) {
    const idDocente =
      this.obtenerIdDocente(usuario);

    await this.validarCoordinadorAsignado(
      this.dataSource.manager,
      idPeriodoCarrera,
      idDocente,
    );

    return this.dataSource.query(
      `
      SELECT
        h.id_periodo_carrera_historial
          AS "idHistorial",

        h.tipo_accion
          AS "tipoAccion",

        h.estado_anterior
          AS "estadoAnterior",

        h.estado_nuevo
          AS "estadoNuevo",

        h.id_coordinador_anterior
          AS "idCoordinadorAnterior",

        CASE
          WHEN da.id_docente IS NULL
            THEN NULL
          ELSE CONCAT(
            da.nombres,
            ' ',
            da.apellidos
          )
        END
          AS "nombreCoordinadorAnterior",

        h.id_coordinador_nuevo
          AS "idCoordinadorNuevo",

        CASE
          WHEN dn.id_docente IS NULL
            THEN NULL
          ELSE CONCAT(
            dn.nombres,
            ' ',
            dn.apellidos
          )
        END
          AS "nombreCoordinadorNuevo",

        h.id_usuario_ejecutor
          AS "idUsuarioEjecutor",

        u.correo
          AS "correoEjecutor",

        h.motivo,

        h.fecha_accion
          AS "fechaAccion"

      FROM periodo_carrera_historial h

      LEFT JOIN docente da
        ON da.id_docente =
          h.id_coordinador_anterior

      LEFT JOIN docente dn
        ON dn.id_docente =
          h.id_coordinador_nuevo

      INNER JOIN usuario u
        ON u.id_usuario =
          h.id_usuario_ejecutor

      WHERE
        h.id_periodo_carrera = $1

      ORDER BY
        h.fecha_accion DESC,
        h.id_periodo_carrera_historial DESC
      `,
      [idPeriodoCarrera],
    );
  }

  /*
   * ============================================================
   * HELPERS DE AUTENTICACIÓN
   * ============================================================
   */

  private obtenerIdDocente(
    usuario: JwtPayload,
  ): number {
    const idDocente =
      Number(usuario.idDocente);

    if (
      !Number.isInteger(idDocente) ||
      idDocente <= 0
    ) {
      throw new ForbiddenException(
        'El usuario autenticado no está vinculado a un docente.',
      );
    }

    return idDocente;
  }

  private obtenerIdUsuario(
    usuario: JwtPayload,
  ): number {
    const idUsuario =
      Number(usuario.sub);

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      throw new ForbiddenException(
        'No fue posible identificar al usuario autenticado.',
      );
    }

    return idUsuario;
  }

  /*
   * ============================================================
   * VALIDAR COORDINADOR DEL PERÍODO
   * ============================================================
   */

  private async validarCoordinadorAsignado(
    manager: EntityManager,
    idPeriodoCarrera: number,
    idDocente: number,
  ): Promise<PeriodoCarreraDb> {
    const resultados =
      await manager.query(
        `
        SELECT
          id_periodo_carrera,
          id_periodo,
          id_carrera,
          estado,
          id_coordinador

        FROM periodo_carrera

        WHERE
          id_periodo_carrera = $1
        `,
        [idPeriodoCarrera],
      );

    const periodo =
      resultados[0] as
        | PeriodoCarreraDb
        | undefined;

    if (!periodo) {
      throw new NotFoundException(
        'El período-carrera no existe.',
      );
    }

    this.validarPropietarioPeriodo(
      periodo,
      idDocente,
    );

    return periodo;
  }

  private async obtenerPeriodoParaActualizar(
    manager: EntityManager,
    idPeriodoCarrera: number,
  ): Promise<PeriodoCarreraDb> {
    const resultados =
      await manager.query(
        `
        SELECT
          id_periodo_carrera,
          id_periodo,
          id_carrera,
          estado,
          id_coordinador

        FROM periodo_carrera

        WHERE
          id_periodo_carrera = $1

        FOR UPDATE
        `,
        [idPeriodoCarrera],
      );

    const periodo =
      resultados[0] as
        | PeriodoCarreraDb
        | undefined;

    if (!periodo) {
      throw new NotFoundException(
        'El período-carrera no existe.',
      );
    }

    return periodo;
  }

  private validarPropietarioPeriodo(
    periodo: PeriodoCarreraDb,
    idDocente: number,
  ): void {
    if (
      Number(
        periodo.id_coordinador,
      ) !== idDocente
    ) {
      throw new ForbiddenException(
        'Solo el coordinador asignado a esta carrera y período puede ejecutar la acción.',
      );
    }
  }

  /*
   * ============================================================
   * RESUMEN INTERNO DE CIERRE
   * ============================================================
   */

  private async consultarResumenCierre(
    manager: EntityManager,
    idPeriodoCarrera: number,
  ): Promise<ResumenCierreDb> {
    const resultados =
      await manager.query(
        `
        SELECT
          pc.id_periodo_carrera
            AS "idPeriodoCarrera",

          (
            SELECT COUNT(*)::int

            FROM oferta_asignatura oa

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera
          )
            AS "totalOfertas",

          (
            SELECT COUNT(*)::int

            FROM matricula_detalle md

            INNER JOIN oferta_asignatura oa
              ON oa.id_oferta_asignatura =
                md.id_oferta_asignatura

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera
          )
            AS "totalMatriculasDetalle",

          (
            SELECT COUNT(*)::int

            FROM vinculacion_estudiante ve

            INNER JOIN matricula_detalle md
              ON md.id_matricula_detalle =
                ve.id_matricula_detalle

            INNER JOIN oferta_asignatura oa
              ON oa.id_oferta_asignatura =
                md.id_oferta_asignatura

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera
          )
            AS "totalVinculaciones",

          (
            SELECT COUNT(*)::int

            FROM practica_estudiante pe

            INNER JOIN matricula_detalle md
              ON md.id_matricula_detalle =
                pe.id_matricula_detalle

            INNER JOIN oferta_asignatura oa
              ON oa.id_oferta_asignatura =
                md.id_oferta_asignatura

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera
          )
            AS "totalPracticas",

          (
            SELECT COUNT(*)::int

            FROM matricula_detalle md

            INNER JOIN oferta_asignatura oa
              ON oa.id_oferta_asignatura =
                md.id_oferta_asignatura

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera

              AND md.estado =
                'CURSANDO'
          )
            AS "matriculasDetallePendientes",

          (
            SELECT COUNT(*)::int

            FROM vinculacion_estudiante ve

            INNER JOIN matricula_detalle md
              ON md.id_matricula_detalle =
                ve.id_matricula_detalle

            INNER JOIN oferta_asignatura oa
              ON oa.id_oferta_asignatura =
                md.id_oferta_asignatura

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera

              AND ve.estado =
                'EN_CURSO'
          )
            AS "vinculacionesPendientes",

          (
            SELECT COUNT(*)::int

            FROM practica_estudiante pe

            INNER JOIN matricula_detalle md
              ON md.id_matricula_detalle =
                pe.id_matricula_detalle

            INNER JOIN oferta_asignatura oa
              ON oa.id_oferta_asignatura =
                md.id_oferta_asignatura

            WHERE
              oa.id_periodo_carrera =
                pc.id_periodo_carrera

              AND pe.estado =
                'EN_CURSO'
          )
            AS "practicasPendientes"

        FROM periodo_carrera pc

        WHERE
          pc.id_periodo_carrera = $1
        `,
        [idPeriodoCarrera],
      );

    const resumen =
      resultados[0] as
        | ResumenCierreDb
        | undefined;

    if (!resumen) {
      throw new NotFoundException(
        'El período-carrera no existe.',
      );
    }

    return resumen;
  }

  private construirResumen(
    resumen: ResumenCierreDb,
  ): ResumenCierreRespuesta {
    const bloqueos: string[] = [];

    if (
      Number(
        resumen
          .matriculasDetallePendientes,
      ) > 0
    ) {
      bloqueos.push(
        `Existen ${resumen.matriculasDetallePendientes} matrículas-detalle en estado CURSANDO.`,
      );
    }

    if (
      Number(
        resumen
          .vinculacionesPendientes,
      ) > 0
    ) {
      bloqueos.push(
        `Existen ${resumen.vinculacionesPendientes} vinculaciones en estado EN_CURSO.`,
      );
    }

    if (
      Number(
        resumen
          .practicasPendientes,
      ) > 0
    ) {
      bloqueos.push(
        `Existen ${resumen.practicasPendientes} prácticas en estado EN_CURSO.`,
      );
    }

    return {
      ...resumen,

      puedeCerrar:
        bloqueos.length === 0,

      bloqueos,
    };
  }

  /*
   * ============================================================
   * VALIDACIÓN DE NUEVO COORDINADOR
   * ============================================================
   */

  private async validarNuevoCoordinador(
    manager: EntityManager,
    idCarrera: number,
    idNuevoCoordinador: number,
  ): Promise<CoordinadorDb> {
    const resultados =
      await manager.query(
        `
        SELECT
          d.id_docente
            AS "idDocente",

          CONCAT(
            d.nombres,
            ' ',
            d.apellidos
          ) AS nombre,

          d.correo

        FROM docente d

        INNER JOIN usuario u
          ON u.id_docente =
            d.id_docente

        INNER JOIN usuario_rol ur
          ON ur.id_usuario =
            u.id_usuario

        INNER JOIN rol r
          ON r.id_rol =
            ur.id_rol

        WHERE
          d.id_docente = $1

          AND d.estado =
            'ACTIVO'

          AND u.estado =
            'ACTIVO'

          AND u.bloqueado =
            false

          AND r.nombre =
            'COORDINADOR'

          AND (
            EXISTS (
              SELECT 1

              FROM periodo_carrera pc2

              WHERE
                pc2.id_carrera = $2

                AND pc2.id_coordinador =
                  d.id_docente
            )

            OR EXISTS (
              SELECT 1

              FROM oferta_asignatura oa2

              INNER JOIN periodo_carrera pc3
                ON pc3.id_periodo_carrera =
                  oa2.id_periodo_carrera

              WHERE
                pc3.id_carrera = $2

                AND oa2.id_docente =
                  d.id_docente
            )
          )
        `,
        [
          idNuevoCoordinador,
          idCarrera,
        ],
      );

    const docente =
      resultados[0] as
        | CoordinadorDb
        | undefined;

    if (!docente) {
      throw new UnprocessableEntityException(
        'El docente seleccionado no es un coordinador activo vinculado a esta carrera.',
      );
    }

    return docente;
  }

  /*
   * ============================================================
   * VALIDACIONES DE FECHAS DE CREACIÓN
   * ============================================================
   */

  private validarFechasCreacion(
    dto: CrearPeriodoCarreraDto,
  ): void {
    const inicio =
      this.convertirFecha(
        dto.fechaInicio,
      );

    const fin =
      this.convertirFecha(
        dto.fechaFin,
      );

    if (fin <= inicio) {
      throw new UnprocessableEntityException(
        'La fecha de finalización debe ser posterior a la fecha de inicio.',
      );
    }

    const pares: Array<{
      nombre: string;
      inicio?: string;
      fin?: string;
    }> = [
      {
        nombre: 'aporte 1',
        inicio:
          dto.fechaInicioAporte1,
        fin:
          dto.fechaFinAporte1,
      },

      {
        nombre: 'aporte 2',
        inicio:
          dto.fechaInicioAporte2,
        fin:
          dto.fechaFinAporte2,
      },

      {
        nombre: 'supletorio',
        inicio:
          dto.fechaInicioSupletorio,
        fin:
          dto.fechaFinSupletorio,
      },

      {
        nombre: 'fase teórica',
        inicio:
          dto.fechaInicioFaseTeorica,
        fin:
          dto.fechaFinFaseTeorica,
      },

      {
        nombre: 'fase práctica',
        inicio:
          dto.fechaInicioFasePractica,
        fin:
          dto.fechaFinFasePractica,
      },
    ];

    for (
      const periodo of pares
    ) {
      const tieneInicio =
        Boolean(periodo.inicio);

      const tieneFin =
        Boolean(periodo.fin);

      if (
        tieneInicio !== tieneFin
      ) {
        throw new UnprocessableEntityException(
          `Debe ingresar tanto la fecha de inicio como la fecha de fin de ${periodo.nombre}.`,
        );
      }

      if (
        !periodo.inicio ||
        !periodo.fin
      ) {
        continue;
      }

      const fechaInicioInterna =
        this.convertirFecha(
          periodo.inicio,
        );

      const fechaFinInterna =
        this.convertirFecha(
          periodo.fin,
        );

      if (
        fechaFinInterna <
        fechaInicioInterna
      ) {
        throw new UnprocessableEntityException(
          `La fecha final de ${periodo.nombre} no puede ser anterior a su fecha inicial.`,
        );
      }

      if (
        fechaInicioInterna <
          inicio ||
        fechaFinInterna >
          fin
      ) {
        throw new UnprocessableEntityException(
          `Las fechas de ${periodo.nombre} deben estar dentro del período académico.`,
        );
      }
    }
  }

  private convertirFecha(
    valor: string,
  ): Date {
    const fecha =
      new Date(
        `${valor}T00:00:00.000Z`,
      );

    if (
      Number.isNaN(
        fecha.getTime(),
      )
    ) {
      throw new UnprocessableEntityException(
        `La fecha ${valor} no es válida.`,
      );
    }

    return fecha;
  }

  private normalizarFecha(
    valor: string | Date,
  ): string {
    if (
      valor instanceof Date
    ) {
      return valor
        .toISOString()
        .substring(0, 10);
    }

    return String(valor)
      .substring(0, 10);
  }
}