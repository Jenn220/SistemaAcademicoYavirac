import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVinculacion1784092350751 implements MigrationInterface {
  name = 'CreateVinculacion1784092350751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.detalle_evaluacion_vinculacion (
    id_detalle_vinc bigint NOT NULL,
    id_evaluacion_vinc bigint NOT NULL,
    id_item bigint NOT NULL,
    puntaje_asignado numeric(5,2) NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.evaluacion_vinculacion (
    id_evaluacion_vinc bigint NOT NULL,
    id_vinculacion bigint NOT NULL,
    id_rubrica bigint NOT NULL,
    nota_final numeric(5,2),
    fecha_evaluacion date DEFAULT CURRENT_DATE
);
    `);

    await queryRunner.query(`
CREATE TABLE public.vinculacion_actividad_estudiante (
    id_actividad_estudiante bigint CONSTRAINT vinculacion_actividad_estudian_id_actividad_estudiante_not_null NOT NULL,
    id_vinculacion bigint NOT NULL,
    fecha date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    horas_total numeric(5,2) NOT NULL,
    actividades_realizadas text CONSTRAINT vinculacion_actividad_estudiant_actividades_realizadas_not_null NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.vinculacion_asistencia_tutor (
    id_asistencia_tutor bigint NOT NULL,
    id_vinculacion bigint NOT NULL,
    fecha date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    horas_total numeric(5,2) NOT NULL,
    observaciones text
);
    `);

    await queryRunner.query(`
CREATE TABLE public.vinculacion_estudiante (
    id_vinculacion bigint NOT NULL,
    id_periodo bigint NOT NULL,
    id_matricula_detalle bigint NOT NULL,
    id_empresa bigint NOT NULL,
    id_docente bigint NOT NULL,
    nombre_proyecto character varying(255) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    total_horas_estudiante numeric(5,2) DEFAULT 0 NOT NULL,
    total_horas_docente numeric(5,2) DEFAULT 0 NOT NULL,
    estado character varying(30) DEFAULT 'EN_CURSO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.vinculacion_informe (
    id_informe bigint NOT NULL,
    id_vinculacion bigint NOT NULL,
    fecha_informe date NOT NULL,
    actividad_macro text NOT NULL,
    resultado_aprendizaje text NOT NULL
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.detalle_evaluacion_vinculacion_id_detalle_vinc_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.evaluacion_vinculacion_id_evaluacion_vinc_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.vinculacion_actividad_estudiante_id_actividad_estudiante_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.vinculacion_asistencia_tutor_id_asistencia_tutor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.vinculacion_estudiante_id_vinculacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.vinculacion_informe_id_informe_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.detalle_evaluacion_vinculacion_id_detalle_vinc_seq OWNED BY public.detalle_evaluacion_vinculacion.id_detalle_vinc;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.evaluacion_vinculacion_id_evaluacion_vinc_seq OWNED BY public.evaluacion_vinculacion.id_evaluacion_vinc;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.vinculacion_actividad_estudiante_id_actividad_estudiante_seq OWNED BY public.vinculacion_actividad_estudiante.id_actividad_estudiante;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.vinculacion_asistencia_tutor_id_asistencia_tutor_seq OWNED BY public.vinculacion_asistencia_tutor.id_asistencia_tutor;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.vinculacion_estudiante_id_vinculacion_seq OWNED BY public.vinculacion_estudiante.id_vinculacion;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.vinculacion_informe_id_informe_seq OWNED BY public.vinculacion_informe.id_informe;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion_vinculacion ALTER COLUMN id_detalle_vinc SET DEFAULT nextval('public.detalle_evaluacion_vinculacion_id_detalle_vinc_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_vinculacion ALTER COLUMN id_evaluacion_vinc SET DEFAULT nextval('public.evaluacion_vinculacion_id_evaluacion_vinc_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_actividad_estudiante ALTER COLUMN id_actividad_estudiante SET DEFAULT nextval('public.vinculacion_actividad_estudiante_id_actividad_estudiante_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_asistencia_tutor ALTER COLUMN id_asistencia_tutor SET DEFAULT nextval('public.vinculacion_asistencia_tutor_id_asistencia_tutor_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante ALTER COLUMN id_vinculacion SET DEFAULT nextval('public.vinculacion_estudiante_id_vinculacion_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_informe ALTER COLUMN id_informe SET DEFAULT nextval('public.vinculacion_informe_id_informe_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion_vinculacion
    ADD CONSTRAINT detalle_evaluacion_vinculacion_pkey PRIMARY KEY (id_detalle_vinc);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_vinculacion
    ADD CONSTRAINT evaluacion_vinculacion_pkey PRIMARY KEY (id_evaluacion_vinc);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_actividad_estudiante
    ADD CONSTRAINT vinculacion_actividad_estudiante_pkey PRIMARY KEY (id_actividad_estudiante);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_asistencia_tutor
    ADD CONSTRAINT vinculacion_asistencia_tutor_pkey PRIMARY KEY (id_asistencia_tutor);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante
    ADD CONSTRAINT vinculacion_estudiante_pkey PRIMARY KEY (id_vinculacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_informe
    ADD CONSTRAINT vinculacion_informe_pkey PRIMARY KEY (id_informe);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante
    ADD CONSTRAINT vinculacion_estudiante_id_matricula_detalle_key UNIQUE (id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion_vinculacion
    ADD CONSTRAINT fk_dev_evaluacion FOREIGN KEY (id_evaluacion_vinc) REFERENCES public.evaluacion_vinculacion(id_evaluacion_vinc);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion_vinculacion
    ADD CONSTRAINT fk_dev_item FOREIGN KEY (id_item) REFERENCES public.item_rubrica(id_item);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_vinculacion
    ADD CONSTRAINT fk_ev_rubrica FOREIGN KEY (id_rubrica) REFERENCES public.catalogo_rubrica(id_rubrica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_vinculacion
    ADD CONSTRAINT fk_ev_vinculacion FOREIGN KEY (id_vinculacion) REFERENCES public.vinculacion_estudiante(id_vinculacion);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.detalle_evaluacion_vinculacion`);
    await queryRunner.query(`DROP TABLE public.evaluacion_vinculacion`);
    await queryRunner.query(`DROP TABLE public.vinculacion_informe`);
    await queryRunner.query(`DROP TABLE public.vinculacion_asistencia_tutor`);
    await queryRunner.query(`DROP TABLE public.vinculacion_actividad_estudiante`);
    await queryRunner.query(`DROP TABLE public.vinculacion_estudiante`);
  }
}
