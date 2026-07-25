import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVinculacionReporteObservacion1784937100000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE public.vinculacion_reporte_observacion (
                id_observacion BIGSERIAL PRIMARY KEY,
                id_vinculacion BIGINT NOT NULL REFERENCES public.vinculacion_estudiante(id_vinculacion),
                tipo_reporte VARCHAR(30) NOT NULL,
                observacion TEXT NOT NULL,
                CONSTRAINT chk_vro_tipo_reporte CHECK (
                    tipo_reporte IN ('INFORME_FINAL', 'ASISTENCIA_TUTOR', 'ASISTENCIA_ESTUDIANTE')
                )
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_vro_vinculacion
                ON public.vinculacion_reporte_observacion USING btree (id_vinculacion);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS public.vinculacion_reporte_observacion;`);
    }
}
