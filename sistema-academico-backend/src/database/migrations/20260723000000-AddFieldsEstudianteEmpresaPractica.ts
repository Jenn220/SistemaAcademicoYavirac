import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsEstudianteEmpresaPractica20260723000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.estudiante
            ADD COLUMN IF NOT EXISTS estado_civil varchar(20),
            ADD COLUMN IF NOT EXISTS tipo_sangre varchar(10),
            ADD COLUMN IF NOT EXISTS domicilio text,
            ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre varchar(200),
            ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono varchar(50);
        `);

        await queryRunner.query(`
            ALTER TABLE public.empresa
            ADD COLUMN IF NOT EXISTS telefono varchar(50),
            ADD COLUMN IF NOT EXISTS correo varchar(150),
            ADD COLUMN IF NOT EXISTS representante_legal varchar(200);
        `);

        await queryRunner.query(`
            ALTER TABLE public.practica_estudiante
            ADD COLUMN IF NOT EXISTS fecha_inicio date,
            ADD COLUMN IF NOT EXISTS fecha_fin date,
            ADD COLUMN IF NOT EXISTS nombre_proyecto varchar(255),
            ADD COLUMN IF NOT EXISTS cobertura_localizacion varchar(255),
            ADD COLUMN IF NOT EXISTS plazo_ejecucion varchar(100),
            ADD COLUMN IF NOT EXISTS tipo_sangre varchar(5),
            ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre varchar(150),
            ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono varchar(20);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS contacto_emergencia_telefono, DROP COLUMN IF EXISTS contacto_emergencia_nombre, DROP COLUMN IF EXISTS tipo_sangre, DROP COLUMN IF EXISTS plazo_ejecucion, DROP COLUMN IF EXISTS cobertura_localizacion, DROP COLUMN IF EXISTS nombre_proyecto, DROP COLUMN IF EXISTS fecha_fin, DROP COLUMN IF EXISTS fecha_inicio;`);
        await queryRunner.query(`ALTER TABLE public.empresa DROP COLUMN IF EXISTS representante_legal, DROP COLUMN IF EXISTS correo, DROP COLUMN IF EXISTS telefono;`);
        await queryRunner.query(`ALTER TABLE public.estudiante DROP COLUMN IF EXISTS contacto_emergencia_telefono, DROP COLUMN IF EXISTS contacto_emergencia_nombre, DROP COLUMN IF EXISTS domicilio, DROP COLUMN IF EXISTS tipo_sangre, DROP COLUMN IF EXISTS estado_civil;`);
    }
}
