import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePortafolioDatosPrueba1784218110000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, ruta_archivo_pdf, estado)
            SELECT (SELECT id_periodo FROM public.periodo_academico LIMIT 1),
                   (SELECT id_oferta_asignatura FROM public.oferta_asignatura LIMIT 1),
                   'APORTE_1', NULL, 'GENERADO';
        `);
        await queryRunner.query(`
            INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
            SELECT (SELECT id_reporte_notas FROM public.portafolio_reporte_notas LIMIT 1),
                   (SELECT id_matricula_detalle FROM public.matricula_detalle LIMIT 1),
                   9.5, 'PENDIENTE';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.portafolio_aceptacion_estudiante;`);
        await queryRunner.query(`DELETE FROM public.portafolio_reporte_notas;`);
    }
}
