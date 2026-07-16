import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResultadoAprendizaje1784158416558 implements MigrationInterface {
    name = 'AddResultadoAprendizaje1784158416558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Solo agregamos tu columna a tu tabla
        await queryRunner.query(`ALTER TABLE "vinculacion_actividad_estudiante" ADD "resultado_aprendizaje" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // En caso de revertir la migración, solo borramos tu columna
        await queryRunner.query(`ALTER TABLE "vinculacion_actividad_estudiante" DROP COLUMN "resultado_aprendizaje"`);
    }
}