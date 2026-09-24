# Resumen de tablas y relaciones

Documento generado a partir del respaldo binario de PostgreSQL.

## Resumen general

- Tablas: **41**
- Claves primarias: **41**
- Claves foráneas: **48**
- Restricciones únicas: **18**
- Índices: **7**
- Vistas: **1**

## Tablas

- `asignatura`
- `bitacora_semanal`
- `carrera`
- `catalogo_rubrica`
- `cv_dato_academico`
- `cv_experiencia_laboral`
- `cv_practica_dual`
- `detalle_evaluacion`
- `detalle_evaluacion_vinculacion`
- `docente`
- `empresa`
- `estudiante`
- `evaluacion_plan_marco`
- `evaluacion_practica`
- `evaluacion_vinculacion`
- `informe_aprendizaje`
- `item_plan_marco`
- `item_rubrica`
- `jornada`
- `matricula`
- `matricula_detalle`
- `nivel`
- `oferta_asignatura`
- `paralelo`
- `periodo_academico`
- `periodo_carrera`
- `plan_marco_formacion`
- `plan_rotacion`
- `plan_rotacion_semana`
- `portafolio_aceptacion_estudiante`
- `portafolio_reporte_notas`
- `practica_estudiante`
- `registro_diario_practica`
- `rol`
- `tutor_empresarial`
- `usuario`
- `usuario_rol`
- `vinculacion_actividad_estudiante`
- `vinculacion_asistencia_tutor`
- `vinculacion_estudiante`
- `vinculacion_informe`

## Relaciones entre tablas

| Tabla origen | Columna(s) | Tabla relacionada | Columna(s) referenciada(s) | Restricción |
|---|---|---|---|---|
| `asignatura` | `id_nivel` | `nivel` | `id_nivel` | `fk_asignatura_nivel` |
| `bitacora_semanal` | `id_informe` | `informe_aprendizaje` | `id_informe` | `fk_bs_informe` |
| `cv_dato_academico` | `id_estudiante` | `estudiante` | `id_estudiante` | `fk_cv_da_estudiante` |
| `cv_experiencia_laboral` | `id_estudiante` | `estudiante` | `id_estudiante` | `fk_cv_el_estudiante` |
| `cv_practica_dual` | `id_estudiante` | `estudiante` | `id_estudiante` | `fk_cv_pd_estudiante` |
| `detalle_evaluacion` | `id_evaluacion` | `evaluacion_practica` | `id_evaluacion` | `fk_de_evaluacion` |
| `detalle_evaluacion` | `id_item` | `item_rubrica` | `id_item` | `fk_de_item` |
| `matricula_detalle` | `id_matricula` | `matricula` | `id_matricula` | `fk_detalle_matricula` |
| `matricula_detalle` | `id_oferta_asignatura` | `oferta_asignatura` | `id_oferta_asignatura` | `fk_detalle_oferta` |
| `detalle_evaluacion_vinculacion` | `id_evaluacion_vinc` | `evaluacion_vinculacion` | `id_evaluacion_vinc` | `fk_dev_evaluacion` |
| `detalle_evaluacion_vinculacion` | `id_item` | `item_rubrica` | `id_item` | `fk_dev_item` |
| `evaluacion_practica` | `id_practica` | `practica_estudiante` | `id_practica` | `fk_ep_practica` |
| `evaluacion_practica` | `id_rubrica` | `catalogo_rubrica` | `id_rubrica` | `fk_ep_rubrica` |
| `evaluacion_plan_marco` | `id_item_pm` | `item_plan_marco` | `id_item_pm` | `fk_epm_item_pm` |
| `evaluacion_plan_marco` | `id_practica` | `practica_estudiante` | `id_practica` | `fk_epm_practica` |
| `evaluacion_vinculacion` | `id_rubrica` | `catalogo_rubrica` | `id_rubrica` | `fk_ev_rubrica` |
| `evaluacion_vinculacion` | `id_vinculacion` | `vinculacion_estudiante` | `id_vinculacion` | `fk_ev_vinculacion` |
| `informe_aprendizaje` | `id_practica` | `practica_estudiante` | `id_practica` | `fk_ia_practica` |
| `item_plan_marco` | `id_plan_marco` | `plan_marco_formacion` | `id_plan_marco` | `fk_ipm_plan_marco` |
| `item_rubrica` | `id_rubrica` | `catalogo_rubrica` | `id_rubrica` | `fk_ir_rubrica` |
| `matricula` | `id_carrera` | `carrera` | `id_carrera` | `fk_matricula_carrera` |
| `matricula` | `id_estudiante` | `estudiante` | `id_estudiante` | `fk_matricula_estudiante` |
| `matricula` | `id_periodo` | `periodo_academico` | `id_periodo` | `fk_matricula_periodo` |
| `nivel` | `id_carrera` | `carrera` | `id_carrera` | `fk_nivel_carrera` |
| `oferta_asignatura` | `id_asignatura` | `asignatura` | `id_asignatura` | `fk_oferta_asignatura` |
| `oferta_asignatura` | `id_docente` | `docente` | `id_docente` | `fk_oferta_docente` |
| `oferta_asignatura` | `id_jornada` | `jornada` | `id_jornada` | `fk_oferta_jornada` |
| `oferta_asignatura` | `id_paralelo` | `paralelo` | `id_paralelo` | `fk_oferta_paralelo` |
| `oferta_asignatura` | `id_periodo_carrera` | `periodo_carrera` | `id_periodo_carrera` | `fk_oferta_periodo_carrera` |
| `portafolio_aceptacion_estudiante` | `id_matricula_detalle` | `matricula_detalle` | `id_matricula_detalle` | `fk_pae_matricula_det` |
| `portafolio_aceptacion_estudiante` | `id_reporte_notas` | `portafolio_reporte_notas` | `id_reporte_notas` | `fk_pae_reporte` |
| `periodo_carrera` | `id_carrera` | `carrera` | `id_carrera` | `fk_pc_carrera` |
| `periodo_carrera` | `id_periodo` | `periodo_academico` | `id_periodo` | `fk_pc_periodo` |
| `practica_estudiante` | `id_docente` | `docente` | `id_docente` | `fk_pe_docente` |
| `practica_estudiante` | `id_empresa` | `empresa` | `id_empresa` | `fk_pe_empresa` |
| `practica_estudiante` | `id_matricula_detalle` | `matricula_detalle` | `id_matricula_detalle` | `fk_pe_matricula_detalle` |
| `practica_estudiante` | `id_periodo` | `periodo_academico` | `id_periodo` | `fk_pe_periodo` |
| `practica_estudiante` | `id_tutor_empresarial` | `tutor_empresarial` | `id_tutor_empresarial` | `fk_pe_tutor_empresarial` |
| `plan_marco_formacion` | `id_nivel` | `nivel` | `id_nivel` | `fk_pmf_nivel` |
| `plan_rotacion` | `id_item_pm` | `item_plan_marco` | `id_item_pm` | `fk_pr_item_pm` |
| `plan_rotacion` | `id_practica` | `practica_estudiante` | `id_practica` | `fk_pr_practica` |
| `portafolio_reporte_notas` | `id_oferta_asignatura` | `oferta_asignatura` | `id_oferta_asignatura` | `fk_prn_oferta` |
| `portafolio_reporte_notas` | `id_periodo` | `periodo_academico` | `id_periodo` | `fk_prn_periodo` |
| `plan_rotacion_semana` | `id_plan_rotacion` | `plan_rotacion` | `id_plan_rotacion` | `fk_prs_plan_rotacion` |
| `registro_diario_practica` | `id_practica` | `practica_estudiante` | `id_practica` | `fk_rdp_practica` |
| `tutor_empresarial` | `id_empresa` | `empresa` | `id_empresa` | `fk_te_empresa` |
| `usuario_rol` | `id_rol` | `rol` | `id_rol` | `fk_usuario_rol_rol` |
| `usuario_rol` | `id_usuario` | `usuario` | `id_usuario` | `fk_usuario_rol_usuario` |

## Vistas

- `vw_reporte_notas`
