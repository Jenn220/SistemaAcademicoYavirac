import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFasePractica1784092341224 implements MigrationInterface {
  name = 'CreateFasePractica1784092341224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.bitacora_semanal (
    id_bitacora bigint NOT NULL,
    id_informe bigint NOT NULL,
    semana integer NOT NULL,
    fecha_inicio_semana date,
    fecha_fin_semana date,
    puesto_aprendizaje character varying(150),
    actividades_realizadas text,
    actividades_autonomas text
);
    `);

    await queryRunner.query(`
CREATE TABLE public.cv_dato_academico (
    id_cv_dato_academico bigint NOT NULL,
    id_estudiante bigint NOT NULL,
    anio character varying(20) NOT NULL,
    institucion character varying(150) NOT NULL,
    titulo_mencion character varying(150) NOT NULL,
    nota_final numeric(5,2)
);
    `);

    await queryRunner.query(`
CREATE TABLE public.cv_experiencia_laboral (
    id_cv_experiencia_laboral bigint NOT NULL,
    id_estudiante bigint NOT NULL,
    anio character varying(20) NOT NULL,
    institucion character varying(150) NOT NULL,
    cargo character varying(100) NOT NULL,
    actividades text NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.cv_practica_dual (
    id_cv_practica_dual bigint NOT NULL,
    id_estudiante bigint NOT NULL,
    anio_periodo character varying(20) NOT NULL,
    institucion character varying(150) NOT NULL,
    cargo character varying(100) NOT NULL,
    actividades_realizadas text NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.detalle_evaluacion (
    id_detalle_evaluacion bigint NOT NULL,
    id_evaluacion bigint NOT NULL,
    id_item bigint NOT NULL,
    puntaje_asignado numeric(5,2) NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.evaluacion_plan_marco (
    id_evaluacion_pm bigint NOT NULL,
    id_practica bigint NOT NULL,
    id_item_pm bigint NOT NULL,
    nivel_real_alcanzado integer,
    CONSTRAINT evaluacion_plan_marco_nivel_real_alcanzado_check CHECK (((nivel_real_alcanzado >= 1) AND (nivel_real_alcanzado <= 4)))
);
    `);

    await queryRunner.query(`
CREATE TABLE public.evaluacion_practica (
    id_evaluacion bigint NOT NULL,
    id_practica bigint NOT NULL,
    id_rubrica bigint NOT NULL,
    tipo_evaluador character varying(50) NOT NULL,
    nota_final_calculada numeric(5,2),
    fecha_evaluacion date DEFAULT CURRENT_DATE
);
    `);

    await queryRunner.query(`
CREATE TABLE public.informe_aprendizaje (
    id_informe bigint NOT NULL,
    id_practica bigint NOT NULL,
    reflexion_aprendizaje text,
    observaciones_empresa text
);
    `);

    await queryRunner.query(`
CREATE TABLE public.plan_rotacion (
    id_plan_rotacion bigint NOT NULL,
    id_practica bigint NOT NULL,
    id_item_pm bigint NOT NULL,
    puesto_aprendizaje character varying(150) NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.plan_rotacion_semana (
    id_rotacion_semana bigint NOT NULL,
    id_plan_rotacion bigint NOT NULL,
    semana integer NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.practica_estudiante (
    id_practica bigint NOT NULL,
    id_periodo bigint NOT NULL,
    id_matricula_detalle bigint NOT NULL,
    id_empresa bigint NOT NULL,
    id_tutor_empresarial bigint NOT NULL,
    id_docente bigint NOT NULL,
    total_horas_requeridas integer DEFAULT 400,
    total_horas_cumplidas integer DEFAULT 0,
    estado character varying(30) DEFAULT 'EN_CURSO'::character varying
);
    `);

    await queryRunner.query(`
CREATE TABLE public.registro_diario_practica (
    id_registro_diario bigint NOT NULL,
    id_practica bigint NOT NULL,
    fecha date NOT NULL,
    hora_ingreso time without time zone,
    hora_salida_almuerzo time without time zone,
    hora_regreso_almuerzo time without time zone,
    hora_salida time without time zone,
    observaciones text,
    firma_estudiante boolean DEFAULT false
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.bitacora_semanal_id_bitacora_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.cv_dato_academico_id_cv_dato_academico_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.cv_experiencia_laboral_id_cv_experiencia_laboral_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.cv_practica_dual_id_cv_practica_dual_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.detalle_evaluacion_id_detalle_evaluacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.evaluacion_plan_marco_id_evaluacion_pm_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.evaluacion_practica_id_evaluacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.informe_aprendizaje_id_informe_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.plan_rotacion_id_plan_rotacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.plan_rotacion_semana_id_rotacion_semana_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.practica_estudiante_id_practica_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.registro_diario_practica_id_registro_diario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.bitacora_semanal_id_bitacora_seq OWNED BY public.bitacora_semanal.id_bitacora;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.cv_dato_academico_id_cv_dato_academico_seq OWNED BY public.cv_dato_academico.id_cv_dato_academico;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.cv_experiencia_laboral_id_cv_experiencia_laboral_seq OWNED BY public.cv_experiencia_laboral.id_cv_experiencia_laboral;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.cv_practica_dual_id_cv_practica_dual_seq OWNED BY public.cv_practica_dual.id_cv_practica_dual;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.detalle_evaluacion_id_detalle_evaluacion_seq OWNED BY public.detalle_evaluacion.id_detalle_evaluacion;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.evaluacion_plan_marco_id_evaluacion_pm_seq OWNED BY public.evaluacion_plan_marco.id_evaluacion_pm;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.evaluacion_practica_id_evaluacion_seq OWNED BY public.evaluacion_practica.id_evaluacion;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.informe_aprendizaje_id_informe_seq OWNED BY public.informe_aprendizaje.id_informe;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.plan_rotacion_id_plan_rotacion_seq OWNED BY public.plan_rotacion.id_plan_rotacion;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.plan_rotacion_semana_id_rotacion_semana_seq OWNED BY public.plan_rotacion_semana.id_rotacion_semana;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.practica_estudiante_id_practica_seq OWNED BY public.practica_estudiante.id_practica;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.registro_diario_practica_id_registro_diario_seq OWNED BY public.registro_diario_practica.id_registro_diario;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.bitacora_semanal ALTER COLUMN id_bitacora SET DEFAULT nextval('public.bitacora_semanal_id_bitacora_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_dato_academico ALTER COLUMN id_cv_dato_academico SET DEFAULT nextval('public.cv_dato_academico_id_cv_dato_academico_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_experiencia_laboral ALTER COLUMN id_cv_experiencia_laboral SET DEFAULT nextval('public.cv_experiencia_laboral_id_cv_experiencia_laboral_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_practica_dual ALTER COLUMN id_cv_practica_dual SET DEFAULT nextval('public.cv_practica_dual_id_cv_practica_dual_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion ALTER COLUMN id_detalle_evaluacion SET DEFAULT nextval('public.detalle_evaluacion_id_detalle_evaluacion_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_plan_marco ALTER COLUMN id_evaluacion_pm SET DEFAULT nextval('public.evaluacion_plan_marco_id_evaluacion_pm_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_practica ALTER COLUMN id_evaluacion SET DEFAULT nextval('public.evaluacion_practica_id_evaluacion_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.informe_aprendizaje ALTER COLUMN id_informe SET DEFAULT nextval('public.informe_aprendizaje_id_informe_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion ALTER COLUMN id_plan_rotacion SET DEFAULT nextval('public.plan_rotacion_id_plan_rotacion_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion_semana ALTER COLUMN id_rotacion_semana SET DEFAULT nextval('public.plan_rotacion_semana_id_rotacion_semana_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante ALTER COLUMN id_practica SET DEFAULT nextval('public.practica_estudiante_id_practica_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.registro_diario_practica ALTER COLUMN id_registro_diario SET DEFAULT nextval('public.registro_diario_practica_id_registro_diario_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.bitacora_semanal
    ADD CONSTRAINT bitacora_semanal_pkey PRIMARY KEY (id_bitacora);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_dato_academico
    ADD CONSTRAINT cv_dato_academico_pkey PRIMARY KEY (id_cv_dato_academico);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_experiencia_laboral
    ADD CONSTRAINT cv_experiencia_laboral_pkey PRIMARY KEY (id_cv_experiencia_laboral);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_practica_dual
    ADD CONSTRAINT cv_practica_dual_pkey PRIMARY KEY (id_cv_practica_dual);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion
    ADD CONSTRAINT detalle_evaluacion_pkey PRIMARY KEY (id_detalle_evaluacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_plan_marco
    ADD CONSTRAINT evaluacion_plan_marco_pkey PRIMARY KEY (id_evaluacion_pm);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_practica
    ADD CONSTRAINT evaluacion_practica_pkey PRIMARY KEY (id_evaluacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.informe_aprendizaje
    ADD CONSTRAINT informe_aprendizaje_pkey PRIMARY KEY (id_informe);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion
    ADD CONSTRAINT plan_rotacion_pkey PRIMARY KEY (id_plan_rotacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion_semana
    ADD CONSTRAINT plan_rotacion_semana_pkey PRIMARY KEY (id_rotacion_semana);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT practica_estudiante_pkey PRIMARY KEY (id_practica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.registro_diario_practica
    ADD CONSTRAINT registro_diario_practica_pkey PRIMARY KEY (id_registro_diario);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT practica_estudiante_id_matricula_detalle_key UNIQUE (id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.bitacora_semanal
    ADD CONSTRAINT fk_bs_informe FOREIGN KEY (id_informe) REFERENCES public.informe_aprendizaje(id_informe);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_dato_academico
    ADD CONSTRAINT fk_cv_da_estudiante FOREIGN KEY (id_estudiante) REFERENCES public.estudiante(id_estudiante);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_experiencia_laboral
    ADD CONSTRAINT fk_cv_el_estudiante FOREIGN KEY (id_estudiante) REFERENCES public.estudiante(id_estudiante);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.cv_practica_dual
    ADD CONSTRAINT fk_cv_pd_estudiante FOREIGN KEY (id_estudiante) REFERENCES public.estudiante(id_estudiante);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion
    ADD CONSTRAINT fk_de_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES public.evaluacion_practica(id_evaluacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.detalle_evaluacion
    ADD CONSTRAINT fk_de_item FOREIGN KEY (id_item) REFERENCES public.item_rubrica(id_item);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_practica
    ADD CONSTRAINT fk_ep_practica FOREIGN KEY (id_practica) REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_practica
    ADD CONSTRAINT fk_ep_rubrica FOREIGN KEY (id_rubrica) REFERENCES public.catalogo_rubrica(id_rubrica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_plan_marco
    ADD CONSTRAINT fk_epm_item_pm FOREIGN KEY (id_item_pm) REFERENCES public.item_plan_marco(id_item_pm);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.evaluacion_plan_marco
    ADD CONSTRAINT fk_epm_practica FOREIGN KEY (id_practica) REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.informe_aprendizaje
    ADD CONSTRAINT fk_ia_practica FOREIGN KEY (id_practica) REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT fk_pe_docente FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT fk_pe_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT fk_pe_matricula_detalle FOREIGN KEY (id_matricula_detalle) REFERENCES public.matricula_detalle(id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT fk_pe_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.practica_estudiante
    ADD CONSTRAINT fk_pe_tutor_empresarial FOREIGN KEY (id_tutor_empresarial) REFERENCES public.tutor_empresarial(id_tutor_empresarial);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion
    ADD CONSTRAINT fk_pr_item_pm FOREIGN KEY (id_item_pm) REFERENCES public.item_plan_marco(id_item_pm);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion
    ADD CONSTRAINT fk_pr_practica FOREIGN KEY (id_practica) REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_rotacion_semana
    ADD CONSTRAINT fk_prs_plan_rotacion FOREIGN KEY (id_plan_rotacion) REFERENCES public.plan_rotacion(id_plan_rotacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.registro_diario_practica
    ADD CONSTRAINT fk_rdp_practica FOREIGN KEY (id_practica) REFERENCES public.practica_estudiante(id_practica);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.cv_practica_dual`);
    await queryRunner.query(`DROP TABLE public.cv_experiencia_laboral`);
    await queryRunner.query(`DROP TABLE public.cv_dato_academico`);
    await queryRunner.query(`DROP TABLE public.detalle_evaluacion`);
    await queryRunner.query(`DROP TABLE public.evaluacion_practica`);
    await queryRunner.query(`DROP TABLE public.evaluacion_plan_marco`);
    await queryRunner.query(`DROP TABLE public.bitacora_semanal`);
    await queryRunner.query(`DROP TABLE public.informe_aprendizaje`);
    await queryRunner.query(`DROP TABLE public.plan_rotacion_semana`);
    await queryRunner.query(`DROP TABLE public.plan_rotacion`);
    await queryRunner.query(`DROP TABLE public.registro_diario_practica`);
    await queryRunner.query(`DROP TABLE public.practica_estudiante`);
  }
}
