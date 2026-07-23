import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateVinculacionObjetivoTable1784167448931 implements MigrationInterface { // <- Recuerda usar el nombre de clase autogenerado en tu archivo

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear la tabla 'vinculacion_objetivo'
        await queryRunner.createTable(
            new Table({
                name: "vinculacion_objetivo",
                columns: [
                    {
                        name: "id_vinculacion_objetivo",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "id_vinculacion",
                        type: "bigint",
                        isNullable: false
                    },
                    {
                        name: "descripcion",
                        type: "text",
                        isNullable: false
                    },
                    {
                        name: "orden",
                        type: "int",
                        isNullable: false,
                        default: 1
                    }
                ]
            }),
            true
        );

        // 2. Crear la relación (Llave Foránea) vinculada a 'vinculacion_estudiante'
        await queryRunner.createForeignKey(
            "vinculacion_objetivo",
            new TableForeignKey({
                columnNames: ["id_vinculacion"],
                referencedColumnNames: ["id_vinculacion"],
                referencedTableName: "vinculacion_estudiante",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la tabla (esto borra la llave foránea automáticamente en Postgres)
        await queryRunner.dropTable("vinculacion_objetivo");
    }
}