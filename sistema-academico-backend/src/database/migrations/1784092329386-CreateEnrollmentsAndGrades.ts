import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnrollmentsAndGrades1784092329386 implements MigrationInterface {
  name = 'CreateEnrollmentsAndGrades1784092329386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.matricula (
    id_matricula bigint NOT NULL,
    numero character varying(30),
    id_estudiante bigint NOT NULL,
    id_periodo bigint NOT NULL,
    id_carrera bigint NOT NULL,
    fecha_matricula date DEFAULT CURRENT_DATE NOT NULL,
    tipo_matricula character varying(30),
    estado character varying(20) DEFAULT 'ACTIVA'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.matricula_detalle (
    id_matricula_detalle bigint NOT NULL,
    id_matricula bigint NOT NULL,
    id_oferta_asignatura bigint NOT NULL,
    nota_ap1 numeric(5,2),
    nota_ap2 numeric(5,2),
    nota_supletorio numeric(5,2),
    nota_final numeric(5,2),
    estado character varying(20) DEFAULT 'CURSANDO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.matricula_detalle_id_matricula_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.matricula_id_matricula_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.matricula_detalle_id_matricula_detalle_seq OWNED BY public.matricula_detalle.id_matricula_detalle;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.matricula_id_matricula_seq OWNED BY public.matricula.id_matricula;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula ALTER COLUMN id_matricula SET DEFAULT nextval('public.matricula_id_matricula_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula_detalle ALTER COLUMN id_matricula_detalle SET DEFAULT nextval('public.matricula_detalle_id_matricula_detalle_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula_detalle
    ADD CONSTRAINT matricula_detalle_pkey PRIMARY KEY (id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT matricula_pkey PRIMARY KEY (id_matricula);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT matricula_numero_key UNIQUE (numero);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula_detalle
    ADD CONSTRAINT uk_matricula_oferta UNIQUE (id_matricula, id_oferta_asignatura);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula_detalle
    ADD CONSTRAINT fk_detalle_matricula FOREIGN KEY (id_matricula) REFERENCES public.matricula(id_matricula);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula_detalle
    ADD CONSTRAINT fk_detalle_oferta FOREIGN KEY (id_oferta_asignatura) REFERENCES public.oferta_asignatura(id_oferta_asignatura);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT fk_matricula_carrera FOREIGN KEY (id_carrera) REFERENCES public.carrera(id_carrera);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT fk_matricula_estudiante FOREIGN KEY (id_estudiante) REFERENCES public.estudiante(id_estudiante);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.matricula
    ADD CONSTRAINT fk_matricula_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.matricula_detalle`);
    await queryRunner.query(`DROP TABLE public.matricula`);
  }
}
