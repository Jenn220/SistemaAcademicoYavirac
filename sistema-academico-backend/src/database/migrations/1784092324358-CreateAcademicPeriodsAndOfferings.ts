import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicPeriodsAndOfferings1784092324358 implements MigrationInterface {
  name = 'CreateAcademicPeriodsAndOfferings1784092324358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.asignatura (
    id_asignatura bigint NOT NULL,
    id_nivel bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    horas integer,
    creditos integer,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.nivel (
    id_nivel bigint NOT NULL,
    id_carrera bigint NOT NULL,
    nombre character varying(50) NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.oferta_asignatura (
    id_oferta_asignatura bigint NOT NULL,
    id_periodo_carrera bigint NOT NULL,
    id_asignatura bigint NOT NULL,
    id_docente bigint NOT NULL,
    id_jornada bigint NOT NULL,
    id_paralelo bigint NOT NULL,
    cupos integer DEFAULT 40,
    horas_semanales numeric(5,2),
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.periodo_carrera (
    id_periodo_carrera bigint NOT NULL,
    id_periodo bigint NOT NULL,
    id_carrera bigint NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    fecha_inicio_aporte1 date,
    fecha_fin_aporte1 date,
    fecha_inicio_aporte2 date,
    fecha_fin_aporte2 date,
    fecha_inicio_supletorio date,
    fecha_fin_supletorio date,
    fecha_inicio_fase_teorica date,
    fecha_fin_fase_teorica date,
    fecha_inicio_fase_practica date,
    fecha_fin_fase_practica date,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.asignatura_id_asignatura_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.nivel_id_nivel_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.oferta_asignatura_id_oferta_asignatura_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.periodo_carrera_id_periodo_carrera_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.asignatura_id_asignatura_seq OWNED BY public.asignatura.id_asignatura;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.nivel_id_nivel_seq OWNED BY public.nivel.id_nivel;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.oferta_asignatura_id_oferta_asignatura_seq OWNED BY public.oferta_asignatura.id_oferta_asignatura;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.periodo_carrera_id_periodo_carrera_seq OWNED BY public.periodo_carrera.id_periodo_carrera;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.asignatura ALTER COLUMN id_asignatura SET DEFAULT nextval('public.asignatura_id_asignatura_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.nivel ALTER COLUMN id_nivel SET DEFAULT nextval('public.nivel_id_nivel_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura ALTER COLUMN id_oferta_asignatura SET DEFAULT nextval('public.oferta_asignatura_id_oferta_asignatura_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_carrera ALTER COLUMN id_periodo_carrera SET DEFAULT nextval('public.periodo_carrera_id_periodo_carrera_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.asignatura
    ADD CONSTRAINT asignatura_pkey PRIMARY KEY (id_asignatura);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.nivel
    ADD CONSTRAINT nivel_pkey PRIMARY KEY (id_nivel);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura
    ADD CONSTRAINT oferta_asignatura_pkey PRIMARY KEY (id_oferta_asignatura);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_carrera
    ADD CONSTRAINT periodo_carrera_pkey PRIMARY KEY (id_periodo_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.nivel
    ADD CONSTRAINT uk_nivel_carrera UNIQUE (id_carrera, nombre);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_carrera
    ADD CONSTRAINT uk_pc UNIQUE (id_periodo, id_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.asignatura
    ADD CONSTRAINT fk_asignatura_nivel FOREIGN KEY (id_nivel) REFERENCES public.nivel(id_nivel);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.nivel
    ADD CONSTRAINT fk_nivel_carrera FOREIGN KEY (id_carrera) REFERENCES public.carrera(id_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura
    ADD CONSTRAINT fk_oferta_asignatura FOREIGN KEY (id_asignatura) REFERENCES public.asignatura(id_asignatura);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura
    ADD CONSTRAINT fk_oferta_docente FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura
    ADD CONSTRAINT fk_oferta_jornada FOREIGN KEY (id_jornada) REFERENCES public.jornada(id_jornada);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura
    ADD CONSTRAINT fk_oferta_paralelo FOREIGN KEY (id_paralelo) REFERENCES public.paralelo(id_paralelo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.oferta_asignatura
    ADD CONSTRAINT fk_oferta_periodo_carrera FOREIGN KEY (id_periodo_carrera) REFERENCES public.periodo_carrera(id_periodo_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_carrera
    ADD CONSTRAINT fk_pc_carrera FOREIGN KEY (id_carrera) REFERENCES public.carrera(id_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.periodo_carrera
    ADD CONSTRAINT fk_pc_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.oferta_asignatura`);
    await queryRunner.query(`DROP TABLE public.periodo_carrera`);
    await queryRunner.query(`DROP TABLE public.asignatura`);
    await queryRunner.query(`DROP TABLE public.nivel`);
  }
}
