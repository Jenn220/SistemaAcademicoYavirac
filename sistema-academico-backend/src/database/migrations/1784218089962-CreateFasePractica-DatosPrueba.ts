import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFasePracticaDatosPrueba1784218089962 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Insertar la Empresa de prueba incluyendo los nuevos campos (telefono y correo)
        await queryRunner.query(`
            INSERT INTO public.empresa (ruc, razon_social, direccion, telefono, correo) 
            VALUES ('1790000000001', 'Empresa de Prueba S.A.', 'Av. Amazonas y Patria', '0999999999', 'contacto@empresaprueba.com');
        `);

        // 2. Insertar la Práctica
        // Nota: Asegúrate de que id_estudiante (1), id_docente (1) e id_periodo (1) existan en tu base de datos local
        await queryRunner.query(`
            INSERT INTO public.practica (id_empresa, id_estudiante, id_docente, id_periodo, fecha_inicio, fecha_fin, estado)
            VALUES (1, 1, 1, 1, '2026-05-01', '2026-08-31', 'EN_PROCESO');
        `);

        // 3. Insertar la Bitácora Semanal ligada a la práctica anterior (id_practica = 1)
        await queryRunner.query(`
            INSERT INTO public.bitacora_semanal (id_practica, numero_semana, fecha_inicio, fecha_fin, actividades_planificadas, estado)
            VALUES (1, 1, '2026-05-01', '2026-05-07', 'Configuración de entorno de desarrollo y análisis de requerimientos.', 'APROBADO');
        `);

        // 4. Insertar Registros Diarios ligados a la bitácora anterior (id_bitacora = 1)
        await queryRunner.query(`
            INSERT INTO public.registro_diario (id_bitacora, fecha, hora_entrada, hora_salida, actividades, observaciones)
            VALUES 
            (1, '2026-05-02', '08:00:00', '12:00:00', 'Desarrollo de endpoints del backend para el módulo de estudiantes.', 'Ninguna'),
            (1, '2026-05-03', '08:00:00', '12:00:00', 'Corrección de errores de tipado de TypeScript.', 'Se solucionó el error ts(2307)');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Borramos en orden inverso por restricción de llaves foráneas (de hijas a padres)
        await queryRunner.query(`DELETE FROM public.registro_diario;`);
        await queryRunner.query(`DELETE FROM public.bitacora_semanal;`);
        await queryRunner.query(`DELETE FROM public.practica;`);
        await queryRunner.query(`DELETE FROM public.empresa;`);
    }

}