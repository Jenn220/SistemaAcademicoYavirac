import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicCatalogs1784092117711 implements MigrationInterface {
  name = 'CreateAcademicCatalogs1784092117711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.carrera (
    id_carrera bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    modalidad character varying(30),
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.catalogo_rubrica (
    id_rubrica bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    tipo character varying(50) NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying
);
    `);

    await queryRunner.query(`
CREATE TABLE public.jornada (
    id_jornada bigint NOT NULL,
    nombre character varying(30) NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.paralelo (
    id_paralelo bigint NOT NULL,
    nombre character varying(30) NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.periodo_academico (
    id_periodo bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(50) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.carrera_id_carrera_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.catalogo_rubrica_id_rubrica_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.jornada_id_jornada_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.paralelo_id_paralelo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.periodo_academico_id_periodo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.carrera_id_carrera_seq OWNED BY public.carrera.id_carrera;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.catalogo_rubrica_id_rubrica_seq OWNED BY public.catalogo_rubrica.id_rubrica;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.jornada_id_jornada_seq OWNED BY public.jornada.id_jornada;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.paralelo_id_paralelo_seq OWNED BY public.paralelo.id_paralelo;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.periodo_academico_id_periodo_seq OWNED BY public.periodo_academico.id_periodo;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.carrera ALTER COLUMN id_carrera SET DEFAULT nextval('public.carrera_id_carrera_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.catalogo_rubrica ALTER COLUMN id_rubrica SET DEFAULT nextval('public.catalogo_rubrica_id_rubrica_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.jornada ALTER COLUMN id_jornada SET DEFAULT nextval('public.jornada_id_jornada_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.paralelo ALTER COLUMN id_paralelo SET DEFAULT nextval('public.paralelo_id_paralelo_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_academico ALTER COLUMN id_periodo SET DEFAULT nextval('public.periodo_academico_id_periodo_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.carrera
    ADD CONSTRAINT carrera_pkey PRIMARY KEY (id_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.catalogo_rubrica
    ADD CONSTRAINT catalogo_rubrica_pkey PRIMARY KEY (id_rubrica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.jornada
    ADD CONSTRAINT jornada_pkey PRIMARY KEY (id_jornada);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.paralelo
    ADD CONSTRAINT paralelo_pkey PRIMARY KEY (id_paralelo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_academico
    ADD CONSTRAINT periodo_academico_pkey PRIMARY KEY (id_periodo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.carrera
    ADD CONSTRAINT carrera_codigo_key UNIQUE (codigo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.jornada
    ADD CONSTRAINT jornada_nombre_key UNIQUE (nombre);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.paralelo
    ADD CONSTRAINT paralelo_nombre_key UNIQUE (nombre);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_academico
    ADD CONSTRAINT periodo_academico_codigo_key UNIQUE (codigo);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.catalogo_rubrica`);
    await queryRunner.query(`DROP TABLE public.periodo_academico`);
    await queryRunner.query(`DROP TABLE public.paralelo`);
    await queryRunner.query(`DROP TABLE public.jornada`);
    await queryRunner.query(`DROP TABLE public.carrera`);
  }
}
