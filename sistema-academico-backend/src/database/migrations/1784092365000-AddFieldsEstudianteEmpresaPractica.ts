import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsEstudianteEmpresaPractica1784092365000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.estudiante
            ADD COLUMN IF NOT EXISTS telefono_emergencia varchar(50),
            ADD COLUMN IF NOT EXISTS domicilio text;
        `);

        await queryRunner.query(`
            ALTER TABLE public.empresa
            ADD COLUMN IF NOT EXISTS telefono varchar(20),
            ADD COLUMN IF NOT EXISTS correo varchar(100);
        `);

        await queryRunner.query(`
            ALTER TABLE public.practica_estudiante
            ADD COLUMN IF NOT EXISTS fecha_inicio date,
            ADD COLUMN IF NOT EXISTS fecha_fin date;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS fecha_fin, DROP COLUMN IF EXISTS fecha_inicio;`);
        await queryRunner.query(`ALTER TABLE public.empresa DROP COLUMN IF EXISTS correo, DROP COLUMN IF EXISTS telefono;`);
        await queryRunner.query(`ALTER TABLE public.estudiante DROP COLUMN IF EXISTS domicilio, DROP COLUMN IF EXISTS telefono_emergencia;`);
    }
}
