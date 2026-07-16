import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlanMarcoAndRubrics1784092335313 implements MigrationInterface {
  name = 'CreatePlanMarcoAndRubrics1784092335313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.item_plan_marco (
    id_item_pm bigint NOT NULL,
    id_plan_marco bigint NOT NULL,
    resultado_aprendizaje text NOT NULL,
    nivel_logro_esperado integer NOT NULL,
    CONSTRAINT item_plan_marco_nivel_logro_esperado_check CHECK (((nivel_logro_esperado >= 1) AND (nivel_logro_esperado <= 4)))
);
    `);

    await queryRunner.query(`
CREATE TABLE public.item_rubrica (
    id_item bigint NOT NULL,
    id_rubrica bigint NOT NULL,
    descripcion_criterio text NOT NULL,
    puntaje_maximo numeric(5,2) NOT NULL,
    ponderacion numeric(5,2) NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.plan_marco_formacion (
    id_plan_marco bigint NOT NULL,
    id_nivel bigint NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.item_plan_marco_id_item_pm_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.item_rubrica_id_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.plan_marco_formacion_id_plan_marco_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.item_plan_marco_id_item_pm_seq OWNED BY public.item_plan_marco.id_item_pm;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.item_rubrica_id_item_seq OWNED BY public.item_rubrica.id_item;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.plan_marco_formacion_id_plan_marco_seq OWNED BY public.plan_marco_formacion.id_plan_marco;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.item_plan_marco ALTER COLUMN id_item_pm SET DEFAULT nextval('public.item_plan_marco_id_item_pm_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.item_rubrica ALTER COLUMN id_item SET DEFAULT nextval('public.item_rubrica_id_item_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_marco_formacion ALTER COLUMN id_plan_marco SET DEFAULT nextval('public.plan_marco_formacion_id_plan_marco_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.item_plan_marco
    ADD CONSTRAINT item_plan_marco_pkey PRIMARY KEY (id_item_pm);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.item_rubrica
    ADD CONSTRAINT item_rubrica_pkey PRIMARY KEY (id_item);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_marco_formacion
    ADD CONSTRAINT plan_marco_formacion_pkey PRIMARY KEY (id_plan_marco);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.item_plan_marco
    ADD CONSTRAINT fk_ipm_plan_marco FOREIGN KEY (id_plan_marco) REFERENCES public.plan_marco_formacion(id_plan_marco);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.item_rubrica
    ADD CONSTRAINT fk_ir_rubrica FOREIGN KEY (id_rubrica) REFERENCES public.catalogo_rubrica(id_rubrica);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.plan_marco_formacion
    ADD CONSTRAINT fk_pmf_nivel FOREIGN KEY (id_nivel) REFERENCES public.nivel(id_nivel);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.item_rubrica`);
    await queryRunner.query(`DROP TABLE public.item_plan_marco`);
    await queryRunner.query(`DROP TABLE public.plan_marco_formacion`);
  }
}
