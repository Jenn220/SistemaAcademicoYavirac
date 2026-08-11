import { Injectable, Inject } from '@nestjs/common';
import { 
  INFORME_FINAL_PORT, 
  IInformeFinalPort 
} from '../ports/informe-final.port';
import { UpdateEvaluacionDto } from '../dto/update-evaluacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluacionVinculacion } from '../domain/vinculacion-evaluacion';
import { VinculacionReporteObservacionEntity } from '../domain/vinculacion_reporte_observacion';
import { EvaluacionParametrosTutorEntity } from '../domain/evaluacion-parametros-tutor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InformeFinalService {
  constructor(
    @Inject(INFORME_FINAL_PORT) 
    private readonly repository: IInformeFinalPort,

    @InjectRepository(EvaluacionVinculacion)
    private readonly evaluacionRepo: Repository<EvaluacionVinculacion>,

    @InjectRepository(VinculacionReporteObservacionEntity)
    private readonly observacionRepo: Repository<VinculacionReporteObservacionEntity>,

    // ✅ NUEVO REPOSITORIO PARA PARÁMETROS
    @InjectRepository(EvaluacionParametrosTutorEntity)
    private readonly parametrosRepo: Repository<EvaluacionParametrosTutorEntity>,
  ) {}

  async obtenerInformeFinal(idVinculacion: number) {
    const resultados = await this.repository.obtainInformeFinalRaw(idVinculacion);
    if (!resultados || resultados.length === 0) return null;

    const primerRegistro = resultados[0];
    let totalHorasAcumuladas = 0;

    const actividades = resultados
      .filter((row: any) => row.actividad_fecha !== null)
      .map((row: any) => {
        const fechaParseada = new Date(row.actividad_fecha);
        const fechaFormateada = !isNaN(fechaParseada.getTime())
          ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
          : row.actividad_fecha;

        const horas = parseFloat(row.actividad_horas || 0);
        totalHorasAcumuladas += horas;

        return {
          fecha: fechaFormateada,
          actividades: row.actividades_realizadas,
          horas_cumplidas: horas,
          observaciones: row.actividad_observaciones || "Sin observaciones"
        };
      });

    const objetivosReales = primerRegistro.objetivos_proyecto || [];
    const formatFecha = (f: any) => f ? new Date(f).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A';
    const fechaHoy = new Date().toLocaleDateString('es-ES', { timeZone: 'UTC' });

    const convertirNotaALetras = (nota: number): string => {
      const notasEnLetras: Record<number, string> = {
        10: "Diez", 9: "Nueve", 8: "Ocho", 7: "Siete",
        6: "Seis", 5: "Cinco", 4: "Cuatro", 3: "Tres",
        2: "Dos", 1: "Uno", 0: "Cero"
      };

      const entera = Math.floor(nota);
      const decimal = Math.round((nota - entera) * 100);

      let texto = notasEnLetras[entera] || entera.toString();
      if (decimal > 0) texto += ` con ${decimal}/100`;
      return texto;
    };

    const notaNumerica = parseFloat(primerRegistro.nota_final || 0);

    // ✅ RECUPERAR PARÁMETROS DE EVALUACIÓN
    let parametros = null;
    try {
      const parametrosData = await this.parametrosRepo.findOne({
        where: { idVinculacion: String(idVinculacion) }
      });
      
      if (parametrosData) {
        parametros = {
          puntualidad: parametrosData.puntualidad,
          trabajo_autonomo: parametrosData.trabajoAutonomo,
          asistencia: parametrosData.asistencia,
          etica_profesional: parametrosData.eticaProfesional,
          cumple_tareas: parametrosData.cumpleTareas,
          actitud_proactiva: parametrosData.actitudProactiva,
          coopera_permanentemente: parametrosData.cooperaPermanentemente,
          respeto_autoridad: parametrosData.respetoAutoridad,
          constancia_predisposicion: parametrosData.constanciaPredisposicion,
          responsabilidad_esmero: parametrosData.responsabilidadEsmero,
          habilidad_practica: parametrosData.habilidadPractica,
        };
      }
    } catch (error) {
      // Si no hay parámetros, simplemente no se muestran
      console.log('No se encontraron parámetros de evaluación para esta vinculación');
    }

    return {
      datos_generales: {
        carrera: primerRegistro.carrera,
        fecha_informe: fechaHoy,
        estudiante: primerRegistro.estudiante,
        cedula: primerRegistro.cedula,
        email: primerRegistro.email_estudiante,
        telefono: primerRegistro.telefono_estudiante,
        nombre_proyecto: primerRegistro.nombre_proyecto,
        fecha_inicio: formatFecha(primerRegistro.fecha_inicio),
        fecha_final: formatFecha(primerRegistro.fecha_fin),
        entidad_beneficiaria: primerRegistro.entidad_beneficiaria || "N/A",
        direccion_entidad: primerRegistro.direccion_entidad || "N/A",
        telefono_entidad: primerRegistro.telefono_entidad || "N/A",
        email_entidad: primerRegistro.email_entidad || "N/A",
        tutor_entidad: primerRegistro.tutor_entidad || "Sin asignar",
        docente_tutor: primerRegistro.docente_tutor
      },
      resumen_actividades: actividades,
      total_horas_cumplidas: totalHorasAcumuladas,
      objetivos_proyecto: objetivosReales.map((obj: any) => ({
        objetivo: obj.objetivo,
        actividades: obj.actividades || "Sin especificar",
        avance: obj.avance || "0%",
        resultados: obj.resultados || "Pendiente"
      })),
      reflexion_estudiante: primerRegistro.reflexion_estudiante || "Sin reflexión registrada.",
      evaluacion_final: {
        nota_final: primerRegistro.nota_final || "Sin calificar",
        nota_letras: primerRegistro.nota_final ? convertirNotaALetras(notaNumerica) : "N/A",
        observaciones: primerRegistro.observaciones_evaluacion || "Sin observaciones",
        coordinador: (primerRegistro.coordinador && primerRegistro.coordinador.trim() !== "") 
          ? primerRegistro.coordinador.trim() 
          : "Sin Coordinador Asignado",
        // ✅ AGREGAR PARÁMETROS A LA RESPUESTA
        parametros: parametros
      }
    };
  }

  async guardarEvaluacionFinal(idVinculacion: number, dto: UpdateEvaluacionDto) {
    const idStr = String(idVinculacion);

    // 1. Guardar nota final
    if (dto.notaFinal !== undefined) {
      let evaluacion = await this.evaluacionRepo.findOne({
        where: { idVinculacion: idStr }
      });

      if (evaluacion) {
        evaluacion.notaFinal = dto.notaFinal;
        evaluacion.fechaEvaluacion = new Date();
        await this.evaluacionRepo.save(evaluacion);
      } else {
        evaluacion = this.evaluacionRepo.create({
          idVinculacion: idStr,
          notaFinal: dto.notaFinal!,
          fechaEvaluacion: new Date(),
          idRubrica: dto.idRubrica ?? undefined,
        });
        await this.evaluacionRepo.save(evaluacion);
      }
    }

    // 2. Guardar observaciones
    if (dto.observaciones !== undefined) {
      let reporteObs = await this.observacionRepo.findOne({
        where: { id_vinculacion: idStr, tipo_reporte: 'INFORME_FINAL' }
      });

      if (reporteObs) {
        reporteObs.observacion = dto.observaciones;
        await this.observacionRepo.save(reporteObs);
      } else {
        reporteObs = this.observacionRepo.create({
          id_vinculacion: idStr,
          tipo_reporte: 'INFORME_FINAL',
          observacion: dto.observaciones,
        });
        await this.observacionRepo.save(reporteObs);
      }
    }

    // ✅ 3. GUARDAR PARÁMETROS DE EVALUACIÓN
    // Verificar si vienen parámetros en el DTO
    const tieneParametros = 
      dto.puntualidad !== undefined ||
      dto.trabajo_autonomo !== undefined ||
      dto.asistencia !== undefined ||
      dto.etica_profesional !== undefined ||
      dto.cumple_tareas !== undefined ||
      dto.actitud_proactiva !== undefined ||
      dto.coopera_permanentemente !== undefined ||
      dto.respeto_autoridad !== undefined ||
      dto.constancia_predisposicion !== undefined ||
      dto.responsabilidad_esmero !== undefined ||
      dto.habilidad_practica !== undefined;

    if (tieneParametros) {
      // Buscar si ya existe un registro de parámetros para esta vinculación
      let parametros = await this.parametrosRepo.findOne({
        where: { idVinculacion: idStr }
      });

      if (parametros) {
        // Actualizar existente
        if (dto.puntualidad !== undefined) parametros.puntualidad = dto.puntualidad;
        if (dto.trabajo_autonomo !== undefined) parametros.trabajoAutonomo = dto.trabajo_autonomo;
        if (dto.asistencia !== undefined) parametros.asistencia = dto.asistencia;
        if (dto.etica_profesional !== undefined) parametros.eticaProfesional = dto.etica_profesional;
        if (dto.cumple_tareas !== undefined) parametros.cumpleTareas = dto.cumple_tareas;
        if (dto.actitud_proactiva !== undefined) parametros.actitudProactiva = dto.actitud_proactiva;
        if (dto.coopera_permanentemente !== undefined) parametros.cooperaPermanentemente = dto.coopera_permanentemente;
        if (dto.respeto_autoridad !== undefined) parametros.respetoAutoridad = dto.respeto_autoridad;
        if (dto.constancia_predisposicion !== undefined) parametros.constanciaPredisposicion = dto.constancia_predisposicion;
        if (dto.responsabilidad_esmero !== undefined) parametros.responsabilidadEsmero = dto.responsabilidad_esmero;
        if (dto.habilidad_practica !== undefined) parametros.habilidadPractica = dto.habilidad_practica;
        
        await this.parametrosRepo.save(parametros);
      } else {
        // Crear nuevo
        parametros = this.parametrosRepo.create({
          idVinculacion: idStr,
          puntualidad: dto.puntualidad || 0,
          trabajoAutonomo: dto.trabajo_autonomo || 0,
          asistencia: dto.asistencia || 0,
          eticaProfesional: dto.etica_profesional || 0,
          cumpleTareas: dto.cumple_tareas || 0,
          actitudProactiva: dto.actitud_proactiva || 0,
          cooperaPermanentemente: dto.coopera_permanentemente || 0,
          respetoAutoridad: dto.respeto_autoridad || 0,
          constanciaPredisposicion: dto.constancia_predisposicion || 0,
          responsabilidadEsmero: dto.responsabilidad_esmero || 0,
          habilidadPractica: dto.habilidad_practica || 0,
        });
        await this.parametrosRepo.save(parametros);
      }
    }

    return { message: "Evaluación y observaciones guardadas correctamente" };
  }

  async listarInformesPorDocente(idDocente: number) {
    const listado = await this.repository.listarInformesEstudiantesPorDocente(idDocente);
    return listado.map((item) => ({
      id_vinculacion: item.id_vinculacion,
      estudiante: item.estudiante,
      cedula: item.cedula,
      carrera: item.carrera,
      nombre_proyecto: item.nombre_proyecto,
      entidad_beneficiaria: item.entidad_beneficiaria,
      nota_final: item.nota_final ? parseFloat(item.nota_final) : null,
      estado_informe: item.estado_informe,
    }));
  }
}