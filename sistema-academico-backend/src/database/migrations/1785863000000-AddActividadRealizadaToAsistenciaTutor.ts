import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActividadRealizadaToAsistenciaTutor1785863000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agrega la columna permitiendo valores NULL (sin la restricción NOT NULL)
        await queryRunner.query(`
            ALTER TABLE "vinculacion_asistencia_tutor" 
            ADD COLUMN "actividad_realizada" text NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "vinculacion_asistencia_tutor" 
            DROP COLUMN "actividad_realizada";
        `);
    }

}