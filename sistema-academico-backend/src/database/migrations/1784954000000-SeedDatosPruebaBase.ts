import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDatosPruebaBase1784954000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.nucleo_estructurante (id_carrera, nombre, objetivo) VALUES
            (1, 'DESARROLLO WEB BACK-END', 'Desarrollar aplicaciones web tanto del lado del cliente como del servidor utilizando lenguajes de programación web y aplicando algoritmos de búsqueda, ordenamiento, numéricos, estadísticos y criptográficos.')
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.nucleo_estructurante WHERE nombre = 'DESARROLLO WEB BACK-END';`);
    }
}
