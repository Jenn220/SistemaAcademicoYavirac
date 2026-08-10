import { Injectable, Inject } from '@nestjs/common';
import { 
  INFORME_FINAL_PORT, 
  IInformeFinalPort 
} from '../ports/informe-final.port';
import { UpdateEvaluacionDto } from '../dto/update-evaluacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluacionVinculacion } from '../domain/vinculacion-evaluacion';
import { VinculacionReporteObservacionEntity } from '../domain/vinculacion_reporte_observacion';
import { Repository } from 'typeorm';

@Injectable()
export class InformeFinalService {
  constructor(
    @Inject(INFORME_FINAL_PORT) 
    private readonly repository: IInformeFinalPort,

// 2. Puedes inyectar directamente los repositorios que necesites aquí:
    @InjectRepository(EvaluacionVinculacion)
    private readonly evaluacionRepo: Repository<EvaluacionVinculacion>,

    @InjectRepository(VinculacionReporteObservacionEntity)
    private readonly observacionRepo: Repository<VinculacionReporteObservacionEntity>,

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
          : "Sin Coordinador Asignado"
      }
    };
  }
async guardarEvaluacionFinal(idVinculacion: number, dto: UpdateEvaluacionDto) {
    const idStr = String(idVinculacion);

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
    // 👈 Solución al error de idRubrica: si es null o undefined, pásale undefined en lugar de null
    idRubrica: dto.idRubrica ?? undefined, 
  });
  await this.evaluacionRepo.save(evaluacion);
}
    }

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