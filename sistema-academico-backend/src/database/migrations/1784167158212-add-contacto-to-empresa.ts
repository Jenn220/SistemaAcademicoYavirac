import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddContactoToEmpresa1784167158212 implements MigrationInterface { // <- Usa el nombre de clase autogenerado en tu archivo

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("empresa", [
            new TableColumn({
                name: "telefono",
                type: "varchar",
                length: "20",
                isNullable: true
            }),
            new TableColumn({
                name: "correo",
                type: "varchar",
                length: "100",
                isNullable: true
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("empresa", "telefono");
        await queryRunner.dropColumn("empresa", "correo");
    }
}