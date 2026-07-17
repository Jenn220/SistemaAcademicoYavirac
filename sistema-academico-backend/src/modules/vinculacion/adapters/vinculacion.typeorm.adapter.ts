import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVinculacionRepository } from '../ports/vinculacion.repository.port';
import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity'; 
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from '../domain/vinculacion-informe.entity';

import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { CreateInformeDto } from '../dto/create-informe.dto';
import { VinculacionObjetivo } from '../domain/vinculacion-objetivo.entity';
import { CreateVinculacionObjetivoDto } from '../dto/create-objetivo.dto';

@Injectable()
export class VinculacionTypeOrmAdapter implements IVinculacionRepository {
  constructor(
    @InjectRepository(VinculacionActividadEstudiante)
    private readonly actividadRepository: Repository<VinculacionActividadEstudiante>,
    
    @InjectRepository(VinculacionObjetivo)
    private readonly objetivoRepository: Repository<VinculacionObjetivo>,

    @InjectRepository(VinculacionAsistenciaTutor)
    private readonly asistenciaTutorRepository: Repository<VinculacionAsistenciaTutor>,
    
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly vinculacionEstudianteRepository: Repository<VinculacionEstudianteEntity>,
    
    @InjectRepository(VinculacionInforme)
    private readonly informeRepository: Repository<VinculacionInforme>,
  ) {}

  // ====================================================================
  // 1. MÉTODOS DE CREACIÓN (INSERT)
  // Encargados de guardar la información que envía el Frontend.
  // Utilizan 'as any' para manejar correctamente los tipos en TypeORM.
  // ====================================================================

  async crearVinculacion(datos: CreateVinculacionDto): Promise<VinculacionEstudianteEntity> {
    const datosParaGuardar = {
      ...datos,
      id_periodo: datos.id_periodo.toString(),
      id_matricula_detalle: datos.id_matricula_detalle.toString(),
      id_empresa: datos.id_empresa.toString(),
      id_docente: datos.id_docente.toString(),
    };

    // 1. Instanciamos protegiendo el tipado interno contra discrepancias de tipos
    const nuevaVinculacion = this.vinculacionEstudianteRepository.create(datosParaGuardar as any);
    
    // 2. Salvamos usando 'as any' para evitar que asuma arreglos ficticios y casteamos el resultado
    const resultado = await this.vinculacionEstudianteRepository.save(nuevaVinculacion as any);
    
    return resultado as VinculacionEstudianteEntity;
  }

  async crearObjetivo(datos: CreateVinculacionObjetivoDto): Promise<VinculacionObjetivo> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(), // Adaptación para BIGINT
    };

    // 1. Instanciamos protegiendo el tipado interno
    const nuevoObjetivo = this.objetivoRepository.create(datosParaGuardar as any);
    
    // 2. Salvamos usando 'as any' para romper el estricto chequeo de arrays de TS
    const resultado = await this.objetivoRepository.save(nuevoObjetivo as any);
    
    // 3. Retornamos casteando al tipo de entidad correcto (TypeScript lo permite porque 'resultado' viene de un 'any')
    return resultado as VinculacionObjetivo;
  }

  async crearActividadEstudiante(datos: CreateActividadEstudianteDto): Promise<VinculacionActividadEstudiante> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(), // Convertimos para Postgres
    };

    // 1. Instanciamos protegiendo el tipado interno
    const nuevaActividad = this.actividadRepository.create(datosParaGuardar as any);
    
    // 2. Salvamos usando 'as any' y casteamos al retorno de la Entidad correspondiente
    const resultado = await this.actividadRepository.save(nuevaActividad as any);
    
    return resultado as VinculacionActividadEstudiante;
  }

  async crearAsistenciaTutor(datos: CreateAsistenciaTutorDto): Promise<VinculacionAsistenciaTutor> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(),
    };

    // 1. Instanciamos protegiendo el tipado interno
    const nuevaAsistencia = this.asistenciaTutorRepository.create(datosParaGuardar as any);
    
    // 2. Salvamos usando 'as any' y casteamos al retorno de la Entidad correspondiente
    const resultado = await this.asistenciaTutorRepository.save(nuevaAsistencia as any);
    
    return resultado as VinculacionAsistenciaTutor;
  }

  async crearInforme(datos: CreateInformeDto): Promise<VinculacionInforme> {
    const datosParaGuardar = {
      ...datos,
      id_vinculacion: datos.id_vinculacion.toString(), // Adaptación para BIGINT
    };

    // 1. Instanciamos la entidad
    const nuevoInforme = this.informeRepository.create(datosParaGuardar as any);
    
    // 2. Guardamos en la base de datos
    const resultado = await this.informeRepository.save(nuevoInforme as any);
    
    return resultado as VinculacionInforme;
  }


  // ====================================================================
  // 2. CONSULTAS SIMPLES (FIND)
  // Devuelven listados directos de las tablas sin cruces complejos.
  // Ideales para rellenar tablas genéricas en el Frontend.
  // ====================================================================

  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.vinculacionEstudianteRepository.find();
  }

  async obtenerTodosLosObjetivos(): Promise<VinculacionObjetivo[]> {
    return await this.objetivoRepository.find();
  }

  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.actividadRepository.find();
  }

  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.asistenciaTutorRepository.find(); // Devuelve una lista []
  }

  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.informeRepository.find();
  }

  async obtenerObjetivosVinculacion(): Promise<any[]> {
    const query = `
      SELECT 
        id_vinculacion_objetivo,
        id_vinculacion,
        descripcion,
        orden
      FROM public.vinculacion_objetivo
      ORDER BY id_vinculacion_objetivo ASC;
    `;
    // Usamos un repositorio existente para lanzar el query
    return await this.vinculacionEstudianteRepository.query(query);
  }


  // ====================================================================
  // 3. CONSULTAS RAW COMPLEJAS (REPORTES Y DOCUMENTOS)
  // Utilizadas para armar la data de los PDFs y vistas detalladas.
  // Hacen JOINs entre múltiples tablas de la base de datos.
  // ====================================================================

  async obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        -- Remitente (Tutor)
        CONCAT(doc.nombres, ' ', doc.apellidos) AS tutor_nombre,
        doc.cedula AS tutor_cedula,
        
        -- Proyecto
        vinc.nombre_proyecto AS proyecto_nombre,
        vinc.fecha_inicio AS fecha_proyecto,
        
        -- Carrera
        car.nombre AS carrera,
        
        -- Descripción dinámica guardada en el informe
        inf.actividad_macro AS descripcion_actividades
        
      FROM vinculacion_estudiante vinc
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      LEFT JOIN vinculacion_informe inf ON vinc.id_vinculacion = inf.id_vinculacion
      
      WHERE vinc.id_vinculacion = $1
      LIMIT 1;
    `;
    const rows = await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
    return rows.length > 0 ? rows[0] : null;
  }

  async obtainActaCompromisoRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        -- Datos del Estudiante
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula AS cedula_identidad, 
        
        -- Datos Académicos
        car.nombre AS carrera,
        'Tercero' AS nivel,              -- 👈 Asegúrate de que esté exactamente así
        
        -- Datos de la Empresa y Tutor
        emp.razon_social AS entidad_beneficiaria,
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor
        
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      
      WHERE vinc.id_vinculacion = $1;
    `;
    const rows = await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
    return rows.length > 0 ? rows[0] : null;
  }

  async obtainReporteConsolidadoRaw(idVinculacion: number): Promise<any[]> {
    // Usamos SQL crudo para hacer los JOINs entre todas las tablas involucradas
    const query = `
      SELECT 
        -- Datos para la Cabecera 
        car.nombre AS carrera,
        
        -- 👇 AQUÍ CORREGIMOS EL NOMBRE DE LA EMPRESA
        emp.razon_social AS entidad_beneficiaria,
        
        est.nombres AS est_nombres,
        est.apellidos AS est_apellidos,
        vinc.nombre_proyecto,
        doc.nombres AS doc_nombres,
        doc.apellidos AS doc_apellidos,
        
        -- 👇 DEJAMOS ESTO COMO NULO TEMPORALMENTE PARA QUE NO EXPLOTE
        -- (Luego puedes cambiarlo por la tabla correcta donde esté el tutor)
        NULL AS tut_nombres, 
        NULL AS tut_apellidos,
        
        per.nombre AS periodo_academico,
        vinc.total_horas_estudiante,
        
        -- Datos para el Detalle
        act.fecha,
        act.hora_inicio,
        act.hora_fin,
        act.horas_total,
        act.actividades_realizadas
        
      FROM vinculacion_estudiante vinc
      -- Actividades
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
      
      -- Tablas Maestras
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      
      -- 👇 EL CAMBIO ESTÁ AQUÍ (Usamos m.id_carrera en vez de est.id_carrera)
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      
      WHERE vinc.id_vinculacion = $1
      ORDER BY act.fecha ASC;
    `;
    return await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
  }

  async obtainReporteAsistenciaTutorRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        -- Datos para la Cabecera
        car.nombre AS carrera,
        emp.razon_social AS entidad_beneficiaria,
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
        per.nombre AS periodo_academico,
        
        -- Datos para el Detalle (Asistencia del Docente Tutor)
        ast.fecha,
        ast.hora_inicio,
        ast.hora_fin,
        ast.horas_total,
        ast.observaciones AS actividades_realizadas
        
      FROM vinculacion_estudiante vinc
      
      -- 👇 EL NUEVO JOIN CON LA TABLA DEL TUTOR
      LEFT JOIN vinculacion_asistencia_tutor ast ON vinc.id_vinculacion = ast.id_vinculacion
      
      -- Tablas Maestras para la cabecera
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      
      WHERE vinc.id_vinculacion = $1
      ORDER BY ast.fecha ASC;
    `;
    return await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
  }

  async obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]> {
    const query = `
      SELECT 
        -- Datos para la Cabecera
        emp.razon_social AS entidad_beneficiaria,
        'Tercero' AS nivel, -- Dejado fijo por contingencia
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula AS cedula_identidad,
        per.nombre AS ciclo_academico,
        vinc.fecha_inicio AS inicia,
        vinc.fecha_fin AS finaliza,
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
        vinc.nombre_proyecto,
        
        -- Concatenación de Asignaturas vinculadas a la matrícula
        (
          SELECT STRING_AGG(asig.nombre, ' | ') 
          FROM matricula_detalle md
          INNER JOIN oferta_asignatura oa ON md.id_oferta_asignatura = oa.id_oferta_asignatura
          INNER JOIN asignatura asig ON oa.id_asignatura = asig.id_asignatura
          WHERE md.id_matricula = m.id_matricula
        ) AS asignaturas,

        -- Datos del Detalle (Actividades del Estudiante)
        act.fecha,
        act.actividades_realizadas
        
      FROM vinculacion_estudiante vinc
      -- Unión con las actividades del estudiante
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
      
      -- Tablas Maestras
      INNER JOIN periodo_academico per ON vinc.id_periodo = per.id_periodo
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      
      WHERE vinc.id_vinculacion = $1
      ORDER BY act.fecha ASC;
    `;
    return await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
  }

  async obtainCertificadoVinculacionRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula,
        car.nombre AS carrera,
        vinc.nombre_proyecto,
        vinc.fecha_inicio,
        vinc.fecha_fin,
        vinc.total_horas_estudiante,
        emp.razon_social AS institucion,
        -- Igual que antes, dejamos el representante como nulo por si no lo tienes en una tabla
        NULL AS representante
        
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      
      WHERE vinc.id_vinculacion = $1;
    `;
    const rows = await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
    return rows.length > 0 ? rows[0] : null;
  }

  async obtainInformeFinalRaw(idVinculacion: number): Promise<any[]> {
    const query = `
    SELECT 
        -- 1. Datos de Cabecera 
        car.nombre AS carrera,
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula,
        est.correo AS email_estudiante,
        est.telefono AS telefono_estudiante,
        vinc.nombre_proyecto, 
        vinc.fecha_inicio,
        vinc.fecha_fin,
        
        -- 2. Datos de la Empresa 
        emp.razon_social AS entidad_beneficiaria,
        emp.direccion AS direccion_entidad,
        emp.telefono AS telefono_entidad,
        emp.correo AS email_entidad,
        
        -- 3. Docente Tutor
        CONCAT(doc.nombres, ' ', doc.apellidos) AS docente_tutor,
        
        -- 4. Evaluación Final 
        ev.nota_final,
        
        -- 5. Objetivos (Agrupados en JSON)
        (
          SELECT json_agg(
                   json_build_object(
                     'objetivo', obj.descripcion,
                     'orden', obj.orden
                   ) ORDER BY obj.orden ASC
                 )
          FROM vinculacion_objetivo obj
          WHERE obj.id_vinculacion = vinc.id_vinculacion
        ) AS objetivos_proyecto,
        
        -- 6. Datos del Detalle de Actividades 
        act.fecha AS actividad_fecha,
        act.actividades_realizadas AS actividades_realizadas, -- <- Corregida
        act.horas_total AS actividad_horas                    -- <- Corregida
        
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle mat ON vinc.id_matricula_detalle = mat.id_matricula_detalle
      INNER JOIN matricula m ON mat.id_matricula = m.id_matricula
      INNER JOIN estudiante est ON m.id_estudiante = est.id_estudiante
      INNER JOIN carrera car ON m.id_carrera = car.id_carrera
      INNER JOIN docente doc ON vinc.id_docente = doc.id_docente
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      LEFT JOIN vinculacion_actividad_estudiante act ON vinc.id_vinculacion = act.id_vinculacion
      LEFT JOIN evaluacion_vinculacion ev ON vinc.id_vinculacion = ev.id_vinculacion
      
      WHERE vinc.id_vinculacion = $1
      ORDER BY act.fecha ASC;
    `;
    return await this.vinculacionEstudianteRepository.query(query, [idVinculacion]);
  }


  // ====================================================================
  // 4. VALIDACIONES Y ACCESOS
  // Consultas específicas para reglas de negocio (ej: ¿Tiene acceso?).
  // ====================================================================

  async buscarVinculacionActiva(idEstudiante: number): Promise<any> {
    const query = `
      SELECT 
        vinc.id_vinculacion AS id_vinc, -- Corregido: de 'id_vinculacion' a 'id_vinc'
        vinc.estado AS estado,
        vinc.nombre_proyecto AS nombre_proyecto, -- Corregido: de 'nombre_proyecto' a 'nombre_proyecto'
        emp.razon_social AS empresa
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle matdet ON vinc.id_matricula_detalle = matdet.id_matricula_detalle
      INNER JOIN matricula mat ON matdet.id_matricula = mat.id_matricula
      LEFT JOIN empresa emp ON vinc.id_empresa = emp.id_empresa
      WHERE mat.id_estudiante = $1
      -- Corregido: Ordenamos usando la columna real 'id_vinculacion'
      ORDER BY vinc.id_vinculacion DESC
      LIMIT 1;
    `;
    const resultados = await this.vinculacionEstudianteRepository.query(query, [idEstudiante]);
    
    // Si encuentra un registro, lo devuelve. Si el arreglo está vacío, devuelve null.
    return resultados.length > 0 ? resultados[0] : null;
  }
}