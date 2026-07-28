import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactoToEmpresa1784167158212 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "telefono" varchar(20)`);
        await queryRunner.query(`ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "correo" varchar(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "empresa" DROP COLUMN IF EXISTS "telefono"`);
        await queryRunner.query(`ALTER TABLE "empresa" DROP COLUMN IF EXISTS "correo"`);
    }
}