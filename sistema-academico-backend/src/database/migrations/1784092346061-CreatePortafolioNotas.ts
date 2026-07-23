import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortafolioNotas1784092346061 implements MigrationInterface {
  name = 'CreatePortafolioNotas1784092346061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.portafolio_aceptacion_estudiante (
    id_aceptacion bigint NOT NULL,
    id_reporte_notas bigint NOT NULL,
    id_matricula_detalle bigint NOT NULL,
    nota_registrada numeric(5,2),
    estado_aceptacion character varying(20) DEFAULT 'PENDIENTE'::character varying,
    fecha_aceptacion timestamp without time zone
);
    `);

    await queryRunner.query(`
CREATE TABLE public.portafolio_reporte_notas (
    id_reporte_notas bigint NOT NULL,
    id_periodo bigint NOT NULL,
    id_oferta_asignatura bigint NOT NULL,
    tipo_reporte character varying(20) NOT NULL,
    fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ruta_archivo_pdf character varying(255),
    estado character varying(20) DEFAULT 'GENERADO'::character varying,
    CONSTRAINT portafolio_reporte_notas_tipo_reporte_check CHECK (((tipo_reporte)::text = ANY ((ARRAY['APORTE_1'::character varying, 'APORTE_2'::character varying, 'SUPLETORIO'::character varying])::text[])))
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.portafolio_aceptacion_estudiante_id_aceptacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.portafolio_reporte_notas_id_reporte_notas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.portafolio_aceptacion_estudiante_id_aceptacion_seq OWNED BY public.portafolio_aceptacion_estudiante.id_aceptacion;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.portafolio_reporte_notas_id_reporte_notas_seq OWNED BY public.portafolio_reporte_notas.id_reporte_notas;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_aceptacion_estudiante ALTER COLUMN id_aceptacion SET DEFAULT nextval('public.portafolio_aceptacion_estudiante_id_aceptacion_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_reporte_notas ALTER COLUMN id_reporte_notas SET DEFAULT nextval('public.portafolio_reporte_notas_id_reporte_notas_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_aceptacion_estudiante
    ADD CONSTRAINT portafolio_aceptacion_estudiante_pkey PRIMARY KEY (id_aceptacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_reporte_notas
    ADD CONSTRAINT portafolio_reporte_notas_pkey PRIMARY KEY (id_reporte_notas);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_aceptacion_estudiante
    ADD CONSTRAINT uk_pae_reporte_matricula UNIQUE (id_reporte_notas, id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_reporte_notas
    ADD CONSTRAINT uk_prn_oferta_tipo UNIQUE (id_oferta_asignatura, tipo_reporte);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_aceptacion_estudiante
    ADD CONSTRAINT fk_pae_matricula_det FOREIGN KEY (id_matricula_detalle) REFERENCES public.matricula_detalle(id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_aceptacion_estudiante
    ADD CONSTRAINT fk_pae_reporte FOREIGN KEY (id_reporte_notas) REFERENCES public.portafolio_reporte_notas(id_reporte_notas);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_reporte_notas
    ADD CONSTRAINT fk_prn_oferta FOREIGN KEY (id_oferta_asignatura) REFERENCES public.oferta_asignatura(id_oferta_asignatura);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.portafolio_reporte_notas
    ADD CONSTRAINT fk_prn_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.portafolio_aceptacion_estudiante`);
    await queryRunner.query(`DROP TABLE public.portafolio_reporte_notas`);
  }
}
