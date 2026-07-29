import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDatosPruebaBase1784950000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Roles
        await queryRunner.query(`
            INSERT INTO rol (nombre) VALUES ('DOCENTE'), ('ESTUDIANTE'), ('TUTOR_EMPRESARIAL'), ('COORDINADOR')
            ON CONFLICT DO NOTHING;
        `);

        // 2. Carrera
        await queryRunner.query(`
            INSERT INTO carrera (id_carrera, codigo, nombre, estado) VALUES (1, 'DS-01', 'Desarrollo de Software', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 3. Nivel
        await queryRunner.query(`
            INSERT INTO nivel (id_nivel, id_carrera, nombre, estado) VALUES (1, 1, 'Séptimo', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 4. Paralelo
        await queryRunner.query(`
            INSERT INTO paralelo (id_paralelo, nombre, estado) VALUES (1, 'A', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 5. Jornada
        await queryRunner.query(`
            INSERT INTO jornada (id_jornada, nombre, estado) VALUES (1, 'Intensiva', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 6. Asignatura
        await queryRunner.query(`
            INSERT INTO asignatura (id_asignatura, nombre, codigo, id_nivel, estado) VALUES (1, 'Práctica Pre Profesional I', 'PPP1', 1, 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 7. Período académico
        await queryRunner.query(`
            INSERT INTO periodo_academico (id_periodo, codigo, nombre, fecha_inicio, fecha_fin, estado) VALUES (1, '2025-1', '2025 - Primer Periodo', '2025-01-01', '2025-06-30', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 8. Período-carrera
        await queryRunner.query(`
            INSERT INTO periodo_carrera (id_periodo_carrera, id_periodo, id_carrera, fecha_inicio, fecha_fin, estado) VALUES (1, 1, 1, '2025-01-01', '2025-06-30', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 9. Docente (tutor académico)
        await queryRunner.query(`
            INSERT INTO docente (id_docente, nombres, apellidos, correo, estado) VALUES (1, 'Carlos', 'Ruiz', 'carlos.ruiz@yavirac.edu.ec', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 10. Oferta asignatura
        await queryRunner.query(`
            INSERT INTO oferta_asignatura (id_oferta_asignatura, id_asignatura, id_docente, id_periodo_carrera, id_jornada, id_paralelo, estado) VALUES (1, 1, 1, 1, 1, 1, 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 11. Estudiante
        await queryRunner.query(`
            INSERT INTO estudiante (id_estudiante, nombres, apellidos, cedula, correo, telefono, estado) VALUES (1, 'Juan', 'Pérez', '1750000001', 'juan.perez@yavirac.edu.ec', '0988888888', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 12. Empresa
        await queryRunner.query(`
            INSERT INTO empresa (id_empresa, razon_social, ruc, direccion, estado) VALUES (2, 'Empresa XYZ', '1790000000001', 'Av. Principal 123', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 13. Tutor empresarial
        await queryRunner.query(`
            INSERT INTO tutor_empresarial (id_tutor_empresarial, id_empresa, nombres, apellidos, cargo, correo, estado) VALUES (1, 2, 'Ana', 'López', 'Supervisora', 'ana@empresaxyz.com', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 14. Matrícula
        await queryRunner.query(`
            INSERT INTO matricula (id_matricula, id_estudiante, id_periodo, id_carrera, estado) VALUES (1, 1, 1, 1, 'ACTIVA')
            ON CONFLICT DO NOTHING;
        `);

        // 15. Matrícula detalle
        await queryRunner.query(`
            INSERT INTO matricula_detalle (id_matricula_detalle, id_matricula, id_oferta_asignatura, estado) VALUES (1, 1, 1, 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        // 16. Práctica
        await queryRunner.query(`
            INSERT INTO practica_estudiante (id_practica, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, id_periodo, estado)
            VALUES (1, 1, 2, 1, 1, 1, 'EN_CURSO')
            ON CONFLICT (id_practica) DO UPDATE SET estado = 'EN_CURSO', id_empresa = 2, id_tutor_empresarial = 1, id_docente = 1;
        `);

        // 17. Usuarios de prueba
        await queryRunner.query(`
            INSERT INTO usuario (correo, password_hash, estado) VALUES ('ana@empresaxyz.com', '$2a$10$W0vSCybH1fbDYR53Gaq0WOXn1blBip5jifLB3RlNdy9QdWD4Oy/M.', 'ACTIVO') ON CONFLICT (correo) DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO usuario (correo, password_hash, estado) VALUES ('carlos@yavirac.edu.ec', '$2a$10$W0vSCybH1fbDYR53Gaq0WOXn1blBip5jifLB3RlNdy9QdWD4Oy/M.', 'ACTIVO') ON CONFLICT (correo) DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO usuario (correo, password_hash, estado) VALUES ('estudiante@yavirac.edu.ec', '$2a$10$W0vSCybH1fbDYR53Gaq0WOXn1blBip5jifLB3RlNdy9QdWD4Oy/M.', 'ACTIVO') ON CONFLICT (correo) DO NOTHING;
        `);

        // 18. Roles de usuario (mapeo explícito 1 a 1 -- NO cruzar todos contra todos)
        await queryRunner.query(`
            INSERT INTO usuario_rol (id_usuario, id_rol)
            SELECT u.id_usuario, r.id_rol
            FROM (VALUES
                ('ana@empresaxyz.com', 'TUTOR_EMPRESARIAL'),
                ('carlos@yavirac.edu.ec', 'DOCENTE'),
                ('estudiante@yavirac.edu.ec', 'ESTUDIANTE')
            ) AS mapeo(correo, rol_nombre)
            JOIN usuario u ON u.correo = mapeo.correo
            JOIN rol r ON r.nombre = mapeo.rol_nombre
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM usuario_rol WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE correo IN ('ana@empresaxyz.com','carlos@yavirac.edu.ec','estudiante@yavirac.edu.ec'));`);
        await queryRunner.query(`DELETE FROM usuario WHERE correo IN ('ana@empresaxyz.com','carlos@yavirac.edu.ec','estudiante@yavirac.edu.ec');`);
        await queryRunner.query(`DELETE FROM practica_estudiante WHERE id_practica = 1;`);
        await queryRunner.query(`DELETE FROM matricula_detalle WHERE id_matricula_detalle = 1;`);
        await queryRunner.query(`DELETE FROM matricula WHERE id_matricula = 1;`);
        await queryRunner.query(`DELETE FROM tutor_empresarial WHERE id_tutor_empresarial = 1;`);
        await queryRunner.query(`DELETE FROM empresa WHERE id_empresa = 2;`);
        await queryRunner.query(`DELETE FROM estudiante WHERE id_estudiante = 1;`);
        await queryRunner.query(`DELETE FROM oferta_asignatura WHERE id_oferta_asignatura = 1;`);
        await queryRunner.query(`DELETE FROM docente WHERE id_docente = 1;`);
        await queryRunner.query(`DELETE FROM periodo_carrera WHERE id_periodo_carrera = 1;`);
        await queryRunner.query(`DELETE FROM periodo_academico WHERE id_periodo = 1;`);
        await queryRunner.query(`DELETE FROM asignatura WHERE id_asignatura = 1;`);
        await queryRunner.query(`DELETE FROM jornada WHERE id_jornada = 1;`);
        await queryRunner.query(`DELETE FROM paralelo WHERE id_paralelo = 1;`);
        await queryRunner.query(`DELETE FROM nivel WHERE id_nivel = 1;`);
        await queryRunner.query(`DELETE FROM carrera WHERE id_carrera = 1;`);
        await queryRunner.query(`DELETE FROM rol WHERE nombre IN ('DOCENTE','ESTUDIANTE','TUTOR_EMPRESARIAL','COORDINADOR');`);
    }
}
