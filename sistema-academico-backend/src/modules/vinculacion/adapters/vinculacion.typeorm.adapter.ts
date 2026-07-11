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

@Injectable()
export class VinculacionTypeOrmAdapter implements IVinculacionRepository {
  constructor(
    @InjectRepository(VinculacionActividadEstudiante)
    private readonly actividadRepository: Repository<VinculacionActividadEstudiante>,
    
    @InjectRepository(VinculacionAsistenciaTutor)
    private readonly asistenciaTutorRepository: Repository<VinculacionAsistenciaTutor>,
    
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly vinculacionEstudianteRepository: Repository<VinculacionEstudianteEntity>,
    
    @InjectRepository(VinculacionInforme)
    private readonly informeRepository: Repository<VinculacionInforme>,
  ) {}

  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.actividadRepository.find();
  }

  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.asistenciaTutorRepository.find(); // Devuelve una lista []
  }

  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.vinculacionEstudianteRepository.find();
  }

  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.informeRepository.find();
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

async obtainActaCompromisoRaw(idVinculacion: number): Promise<any> {
    const query = `
      SELECT 
        -- Datos del Estudiante
        CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
        est.cedula AS cedula_identidad, 
        
        -- Datos Académicos
        car.nombre AS carrera,
        'Tercero' AS nivel,               -- 👈 Asegúrate de que esté exactamente así
        
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
}