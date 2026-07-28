-- =========================================================
-- DATOS DE PRUEBA — Sistema Académico Yavirac (rama develop)
-- Ajustado 100% al schema real verificado con \dt +
-- information_schema el 15/07/2026 (42 tablas).
-- Ejecutar contra la base ya migrada (no crea tablas).
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- 1. Estructura académica base
-- ---------------------------------------------------------
INSERT INTO carrera (codigo, nombre, modalidad, estado) VALUES
    ('DS-01', 'Desarrollo de Software', 'DUAL', 'ACTIVO');

INSERT INTO nivel (id_carrera, nombre, estado)
SELECT id_carrera, 'Quinto Semestre', 'ACTIVO' FROM carrera WHERE codigo = 'DS-01';

INSERT INTO asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
SELECT id_nivel, 'PPP-501', 'Prácticas Pre Profesionales V', 400, 10, 'ACTIVO'
FROM nivel WHERE nombre = 'Quinto Semestre';

INSERT INTO jornada (nombre, estado) VALUES ('INTENSIVA', 'ACTIVO');
INSERT INTO paralelo (nombre, estado) VALUES ('B', 'ACTIVO');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, estado) VALUES
    ('2026-1P', 'Periodo 2026-1P', '2026-04-01', '2026-08-30', 'ACTIVO');

INSERT INTO periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
SELECT (SELECT id_periodo FROM periodo_academico WHERE codigo = '2026-1P'),
       (SELECT id_carrera FROM carrera WHERE codigo = 'DS-01'),
       '2026-04-01', '2026-08-30', 'ACTIVO';

INSERT INTO docente (cedula, nombres, apellidos, correo, telefono, estado) VALUES
    ('1803980844', 'Byron Rodrigo', 'Moreno Moreno', 'bmoreno@yavirac.edu.ec', '0999000001', 'ACTIVO');

INSERT INTO oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
SELECT (SELECT id_periodo_carrera FROM periodo_carrera LIMIT 1),
       (SELECT id_asignatura FROM asignatura WHERE codigo = 'PPP-501'),
       (SELECT id_docente FROM docente WHERE cedula = '1803980844'),
       (SELECT id_jornada FROM jornada WHERE nombre = 'INTENSIVA'),
       (SELECT id_paralelo FROM paralelo WHERE nombre = 'B'),
       40, 8, 'ACTIVO';

-- ---------------------------------------------------------
-- 2. Estudiante, matrícula
-- ---------------------------------------------------------
INSERT INTO estudiante (cedula, nombres, apellidos, correo, telefono, estado) VALUES
    ('2250022114', 'Kevin Smith', 'Nivesela Armijos', 'ksanivesela@yavirac.edu.ec', '0988000001', 'ACTIVO');

INSERT INTO matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
SELECT (SELECT id_estudiante FROM estudiante WHERE cedula = '2250022114'),
       (SELECT id_periodo FROM periodo_academico WHERE codigo = '2026-1P'),
       (SELECT id_carrera FROM carrera WHERE codigo = 'DS-01'),
       '2026-04-01', 'ORDINARIA', 'ACTIVA';

INSERT INTO matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
SELECT (SELECT id_matricula FROM matricula LIMIT 1),
       (SELECT id_oferta_asignatura FROM oferta_asignatura LIMIT 1),
       9.5, 'CURSANDO';

-- ---------------------------------------------------------
-- 3. Roles y usuario
-- ---------------------------------------------------------
INSERT INTO rol (nombre) VALUES ('ADMIN'), ('DOCENTE'), ('ESTUDIANTE'), ('COORDINADOR');

INSERT INTO usuario (correo, password_hash, estado) VALUES
    ('bmoreno@yavirac.edu.ec', '$2b$10$reemplazar_por_hash_real', 'ACTIVO');

INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT (SELECT id_usuario FROM usuario WHERE correo = 'bmoreno@yavirac.edu.ec'),
       (SELECT id_rol FROM rol WHERE nombre = 'DOCENTE');

-- ---------------------------------------------------------
-- 4. Empresa y tutor empresarial
-- ---------------------------------------------------------
INSERT INTO empresa (ruc, razon_social, direccion, estado) VALUES
    ('179001', 'TechCorp S.A.', 'Av. Amazonas N34-451, Quito', 'ACTIVO');

INSERT INTO tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
SELECT (SELECT id_empresa FROM empresa WHERE ruc = '179001'),
       'Roberto', 'Gómez', 'Jefe de Desarrollo', 'rgomez@techcorp.ec', 'ACTIVO';

-- ---------------------------------------------------------
-- 5. Fase Práctica — cadena completa
-- ---------------------------------------------------------
INSERT INTO practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
SELECT (SELECT id_periodo FROM periodo_academico WHERE codigo = '2026-1P'),
       (SELECT id_matricula_detalle FROM matricula_detalle LIMIT 1),
       (SELECT id_empresa FROM empresa WHERE ruc = '179001'),
       (SELECT id_tutor_empresarial FROM tutor_empresarial LIMIT 1),
       (SELECT id_docente FROM docente WHERE cedula = '1803980844'),
       400, 40, 'EN_CURSO';

INSERT INTO registro_diario_practica (id_practica, fecha, hora_ingreso, hora_salida_almuerzo, hora_regreso_almuerzo, hora_salida, firma_estudiante)
SELECT (SELECT id_practica FROM practica_estudiante LIMIT 1),
       '2026-06-01', '08:00', '13:00', '14:00', '17:00', TRUE;

INSERT INTO plan_marco_formacion (id_nivel, estado)
SELECT (SELECT id_nivel FROM nivel WHERE nombre = 'Quinto Semestre'), 'ACTIVO';

INSERT INTO item_plan_marco (id_plan_marco, resultado_aprendizaje, nivel_logro_esperado)
SELECT (SELECT id_plan_marco FROM plan_marco_formacion LIMIT 1),
       'Desarrollar APIs RESTful documentadas', 4;

INSERT INTO plan_rotacion (id_practica, id_item_pm, puesto_aprendizaje)
SELECT (SELECT id_practica FROM practica_estudiante LIMIT 1),
       (SELECT id_item_pm FROM item_plan_marco LIMIT 1),
       'Backend';

INSERT INTO plan_rotacion_semana (id_plan_rotacion, semana)
SELECT (SELECT id_plan_rotacion FROM plan_rotacion LIMIT 1), 1;

INSERT INTO informe_aprendizaje (id_practica, reflexion_aprendizaje, observaciones_empresa)
SELECT (SELECT id_practica FROM practica_estudiante LIMIT 1),
       'Aprendí a trabajar con APIs REST y bases de datos relacionales.',
       'Buen desempeño, cumple horarios.';

INSERT INTO bitacora_semanal (id_informe, semana, fecha_inicio_semana, fecha_fin_semana, puesto_aprendizaje, actividades_realizadas, actividades_autonomas)
SELECT (SELECT id_informe FROM informe_aprendizaje LIMIT 1), 1, '2026-06-01', '2026-06-07',
       'Backend', 'Creación de endpoints CRUD', 'Investigación de arquitectura hexagonal';

INSERT INTO evaluacion_plan_marco (id_practica, id_item_pm, nivel_real_alcanzado)
SELECT (SELECT id_practica FROM practica_estudiante LIMIT 1),
       (SELECT id_item_pm FROM item_plan_marco LIMIT 1), 4;

-- ---------------------------------------------------------
-- 6. Rúbricas e ítems (compartidos por práctica y vinculación)
-- ---------------------------------------------------------
INSERT INTO catalogo_rubrica (nombre, tipo, estado) VALUES
    ('Rúbrica de Desempeño en Fase Práctica', 'FASE_PRACTICA', 'ACTIVO'),
    ('Rúbrica de Evaluación de Vinculación', 'VINCULACION', 'ACTIVO');

INSERT INTO item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
SELECT id_rubrica, 'Calidad técnica del trabajo entregado', 10, 0.5
FROM catalogo_rubrica WHERE nombre = 'Rúbrica de Desempeño en Fase Práctica';

INSERT INTO item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
SELECT id_rubrica, 'Puntualidad y responsabilidad', 10, 0.5
FROM catalogo_rubrica WHERE nombre = 'Rúbrica de Desempeño en Fase Práctica';

INSERT INTO item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
SELECT id_rubrica, 'Impacto social del proyecto', 10, 1.0
FROM catalogo_rubrica WHERE nombre = 'Rúbrica de Evaluación de Vinculación';

INSERT INTO evaluacion_practica (id_practica, id_rubrica, tipo_evaluador, nota_final_calculada, fecha_evaluacion)
SELECT (SELECT id_practica FROM practica_estudiante LIMIT 1),
       (SELECT id_rubrica FROM catalogo_rubrica WHERE nombre = 'Rúbrica de Desempeño en Fase Práctica'),
       'EMPRESA', 9.00, '2026-06-30';

INSERT INTO detalle_evaluacion (id_evaluacion, id_item, puntaje_asignado)
SELECT (SELECT id_evaluacion FROM evaluacion_practica LIMIT 1),
       (SELECT id_item FROM item_rubrica WHERE descripcion_criterio = 'Calidad técnica del trabajo entregado'),
       9.0;

-- ---------------------------------------------------------
-- 7. Vinculación con la Sociedad — cadena completa
-- ---------------------------------------------------------
INSERT INTO vinculacion_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_docente, nombre_proyecto, fecha_inicio, fecha_fin, total_horas_estudiante, total_horas_docente, estado)
SELECT (SELECT id_periodo FROM periodo_academico WHERE codigo = '2026-1P'),
       (SELECT id_matricula_detalle FROM matricula_detalle LIMIT 1),
       (SELECT id_empresa FROM empresa WHERE ruc = '179001'),
       (SELECT id_docente FROM docente WHERE cedula = '1803980844'),
       'Alfabetización Digital', '2026-05-01', '2026-06-30', 8.0, 2.0, 'EN_CURSO';

INSERT INTO vinculacion_actividad_estudiante (id_vinculacion, fecha, hora_inicio, hora_fin, horas_total, actividades_realizadas)
SELECT (SELECT id_vinculacion FROM vinculacion_estudiante LIMIT 1),
       '2026-05-05', '10:00', '12:00', 2.0, 'Charla a la comunidad sobre herramientas ofimáticas';

INSERT INTO vinculacion_asistencia_tutor (id_vinculacion, fecha, hora_inicio, hora_fin, horas_total, observaciones)
SELECT (SELECT id_vinculacion FROM vinculacion_estudiante LIMIT 1),
       '2026-05-05', '09:00', '10:00', 1.0, 'Supervisión de actividad, todo en orden';

INSERT INTO vinculacion_informe (id_vinculacion, fecha_informe, actividad_macro, resultado_aprendizaje)
SELECT (SELECT id_vinculacion FROM vinculacion_estudiante LIMIT 1),
       '2026-06-30', 'Capacitación en herramientas ofimáticas',
       'Los participantes identifican las partes básicas de un computador y manejan procesadores de texto.';

INSERT INTO evaluacion_vinculacion (id_vinculacion, id_rubrica, nota_final, fecha_evaluacion)
SELECT (SELECT id_vinculacion FROM vinculacion_estudiante LIMIT 1),
       (SELECT id_rubrica FROM catalogo_rubrica WHERE nombre = 'Rúbrica de Evaluación de Vinculación'),
       9.5, '2026-06-30';

INSERT INTO detalle_evaluacion_vinculacion (id_evaluacion_vinc, id_item, puntaje_asignado)
SELECT (SELECT id_evaluacion_vinc FROM evaluacion_vinculacion LIMIT 1),
       (SELECT id_item FROM item_rubrica WHERE descripcion_criterio = 'Impacto social del proyecto'),
       9.5;

-- ---------------------------------------------------------
-- 8. Portafolio Docente
-- ---------------------------------------------------------
INSERT INTO portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, ruta_archivo_pdf, estado)
SELECT (SELECT id_periodo FROM periodo_academico WHERE codigo = '2026-1P'),
       (SELECT id_oferta_asignatura FROM oferta_asignatura LIMIT 1),
       'APORTE_1', NULL, 'GENERADO';

INSERT INTO portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
SELECT (SELECT id_reporte_notas FROM portafolio_reporte_notas LIMIT 1),
       (SELECT id_matricula_detalle FROM matricula_detalle LIMIT 1),
       9.5, 'PENDIENTE';

-- ---------------------------------------------------------
-- 9. CV del estudiante (portafolio de vida académica)
-- ---------------------------------------------------------
INSERT INTO cv_dato_academico (id_estudiante, anio, institucion, titulo_mencion, nota_final)
SELECT (SELECT id_estudiante FROM estudiante WHERE cedula = '2250022114'),
       '2022', 'Unidad Educativa Central', 'Bachiller en Ciencias', 9.2;

INSERT INTO cv_experiencia_laboral (id_estudiante, anio, institucion, cargo, actividades)
SELECT (SELECT id_estudiante FROM estudiante WHERE cedula = '2250022114'),
       '2025', 'SoftSolutions', 'Asistente QA', 'Automatización de pruebas funcionales';

INSERT INTO cv_practica_dual (id_estudiante, anio_periodo, institucion, cargo, actividades_realizadas)
SELECT (SELECT id_estudiante FROM estudiante WHERE cedula = '2250022114'),
       '2025-II', 'InfoTech', 'Junior Developer', 'Soporte técnico y desarrollo de reportes';

COMMIT;

-- =========================================================
-- Verificación rápida:
--   SELECT COUNT(*) FROM practica_estudiante;
--   SELECT COUNT(*) FROM vinculacion_estudiante;
--   SELECT COUNT(*) FROM portafolio_reporte_notas;
-- =========================================================
