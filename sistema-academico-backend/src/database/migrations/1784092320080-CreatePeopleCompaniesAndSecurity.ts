import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePeopleCompaniesAndSecurity1784092320080 implements MigrationInterface {
  name = 'CreatePeopleCompaniesAndSecurity1784092320080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE public.docente (
    id_docente bigint NOT NULL,
    cedula character varying(20),
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    correo character varying(150),
    telefono character varying(20),
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.empresa (
    id_empresa bigint NOT NULL,
    ruc character varying(20) NOT NULL,
    razon_social character varying(200) NOT NULL,
    direccion text,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying
);
    `);

    await queryRunner.query(`
CREATE TABLE public.estudiante (
    id_estudiante bigint NOT NULL,
    cedula character varying(20),
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    correo character varying(150),
    telefono character varying(20),
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.rol (
    id_rol bigint NOT NULL,
    nombre character varying(50) NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.tutor_empresarial (
    id_tutor_empresarial bigint NOT NULL,
    id_empresa bigint NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    cargo character varying(100),
    correo character varying(150),
    estado character varying(20) DEFAULT 'ACTIVO'::character varying
);
    `);

    await queryRunner.query(`
CREATE TABLE public.usuario (
    id_usuario bigint NOT NULL,
    correo character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);
    `);

    await queryRunner.query(`
CREATE TABLE public.usuario_rol (
    id_usuario_rol bigint NOT NULL,
    id_usuario bigint NOT NULL,
    id_rol bigint NOT NULL
);
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.docente_id_docente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.empresa_id_empresa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.estudiante_id_estudiante_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.rol_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.tutor_empresarial_id_tutor_empresarial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
CREATE SEQUENCE public.usuario_rol_id_usuario_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.docente_id_docente_seq OWNED BY public.docente.id_docente;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.empresa_id_empresa_seq OWNED BY public.empresa.id_empresa;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.estudiante_id_estudiante_seq OWNED BY public.estudiante.id_estudiante;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.rol_id_rol_seq OWNED BY public.rol.id_rol;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.tutor_empresarial_id_tutor_empresarial_seq OWNED BY public.tutor_empresarial.id_tutor_empresarial;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;
    `);

    await queryRunner.query(`
ALTER SEQUENCE public.usuario_rol_id_usuario_rol_seq OWNED BY public.usuario_rol.id_usuario_rol;
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.docente ALTER COLUMN id_docente SET DEFAULT nextval('public.docente_id_docente_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.empresa ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresa_id_empresa_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.estudiante ALTER COLUMN id_estudiante SET DEFAULT nextval('public.estudiante_id_estudiante_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.rol ALTER COLUMN id_rol SET DEFAULT nextval('public.rol_id_rol_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.tutor_empresarial ALTER COLUMN id_tutor_empresarial SET DEFAULT nextval('public.tutor_empresarial_id_tutor_empresarial_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario_rol ALTER COLUMN id_usuario_rol SET DEFAULT nextval('public.usuario_rol_id_usuario_rol_seq'::regclass);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_pkey PRIMARY KEY (id_docente);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_pkey PRIMARY KEY (id_estudiante);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.tutor_empresarial
    ADD CONSTRAINT tutor_empresarial_pkey PRIMARY KEY (id_tutor_empresarial);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (id_usuario_rol);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_cedula_key UNIQUE (cedula);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_ruc_key UNIQUE (ruc);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_cedula_key UNIQUE (cedula);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_nombre_key UNIQUE (nombre);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT uk_usuario_rol UNIQUE (id_usuario, id_rol);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.tutor_empresarial
    ADD CONSTRAINT fk_te_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_usuario_rol_rol FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_usuario_rol_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE public.usuario_rol`);
    await queryRunner.query(`DROP TABLE public.usuario`);
    await queryRunner.query(`DROP TABLE public.rol`);
    await queryRunner.query(`DROP TABLE public.tutor_empresarial`);
    await queryRunner.query(`DROP TABLE public.empresa`);
    await queryRunner.query(`DROP TABLE public.estudiante`);
    await queryRunner.query(`DROP TABLE public.docente`);
  }
}
