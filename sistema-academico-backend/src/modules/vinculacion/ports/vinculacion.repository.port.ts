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

export interface IVinculacionRepository {
  obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]>;
  obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]>; // Devuelve arreglo []
  obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]>;
  obtenerTodosLosObjetivos(): Promise<VinculacionObjetivo[]>
  obtenerInformes(): Promise<VinculacionInforme[]>;
  obtainReporteConsolidadoRaw(idVinculacion: number): Promise<any[]>;
  obtainActaCompromisoRaw(idVinculacion: number): Promise<any>;
  obtainReporteAsistenciaTutorRaw(idVinculacion: number): Promise<any[]>;
  obtainCertificadoVinculacionRaw(idVinculacion: number): Promise<any>;
  obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]>;
  crearActividadEstudiante(datos: CreateActividadEstudianteDto): Promise<VinculacionActividadEstudiante>;
  crearAsistenciaTutor(datos: CreateAsistenciaTutorDto): Promise<VinculacionAsistenciaTutor>; 
  crearVinculacion(datos: CreateVinculacionDto): Promise<VinculacionEstudianteEntity>;
  crearInforme(datos: CreateInformeDto): Promise<VinculacionInforme>;
  buscarVinculacionActiva(idEstudiante: number): Promise<any>;
  obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any>;
  obtainInformeFinalRaw(idVinculacion: number): Promise<any[]>;
  crearObjetivo(datos: CreateVinculacionObjetivoDto): Promise<VinculacionObjetivo>;

}

export const VINCULACION_REPOSITORY = 'VINCULACION_REPOSITORY';