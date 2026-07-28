import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { 
  VINCULACION_REPORTES_PORT, 
  IVinculacionReportesPort 
} from '../ports/vinculacion-reportes.port';

@Injectable()
export class VinculacionReportesService {
  constructor(
    @Inject(VINCULACION_REPORTES_PORT)
    private readonly repository: IVinculacionReportesPort,
  ) {}

  // ====================================================================
  // REPORTES Y DOCUMENTOS (GET COMPLEJOS)
  // Toman la "data cruda" del Repositorio, formatean fechas, calculan 
  // totales y estructuran el JSON perfecto para el Frontend/PDFs.
  // ====================================================================

  async obtenerActaCompromiso(idVinculacion: number) {
  const data = await this.repository.obtainActaCompromisoRaw(idVinculacion);

  if (!data) {
    return null; 
  }

  return {
    titulo: "ACTA COMPROMISO DE PARTICIPACIÓN EN VINCULACIÓN CON LA COMUNIDAD",
    instituto: 'Instituto Superior Tecnológico de Turismo y Patrimonio "YAVIRAC"',
    estudiante: data.estudiante,
    cedula: data.cedula_identidad,
    carrera: data.carrera,
    nivel: data.nivel || "Tercero",
    entidad_beneficiaria: data.entidad_beneficiaria,
    docente_tutor: data.docente_tutor || "Sin Docente Asignado"
  };
}
async obtenerInicioActividadesTutor(idVinculacion: number) {
  const data = await this.repository.obtainInicioActividadesTutorRaw(idVinculacion);

  // 1. Si no hay datos en la BD, se retorna null explícitamente
  if (!data) {
    return null;
  }

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return !isNaN(fecha.getTime())
      ? fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : fechaStr;
  };

  const coordinador = data.coordinador?.trim();

  // 2. Todos los campos vienen dinámicamente del objeto `data`
  return {
    coordinador: (coordinador && coordinador !== '') ? coordinador : 'Sin Coordinador Asignado',
    tutor_nombre: data.tutor_nombre,
    tutor_cedula: data.tutor_cedula,
    proyecto_nombre: data.proyecto_nombre,
    fecha_inicio: formatearFecha(data.fecha_proyecto),
    carrera: data.carrera,
    entidad_beneficiaria: data.entidad_beneficiaria,
    tutor_entidad: data.tutor_entidad || 'Sin Tutor Receptora Asignado',
    descripcion_actividades: data.descripcion_actividades || '',
  };
}

async obtenerAsistenciaEstudiante(idVinculacion: number) {
  const resultados = await this.repository.obtenerAsistenciaEstudianteRaw(idVinculacion);

  if (!resultados || resultados.length === 0) {
    return null;
  }

  const primerRegistro = resultados[0];

  const actividades = resultados
    .filter((row: any) => row.fecha !== null)
    .map((row: any) => {
      const fechaParseada = new Date(row.fecha);
      const fechaFormateada = !isNaN(fechaParseada.getTime())
        ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
        : row.fecha;

      return {
        fecha: fechaFormateada,
        hora_entrada: row.hora_inicio,
        hora_salida: row.hora_fin,
        total_horas: parseFloat(row.horas_total || 0),
        actividad_realizada: row.actividades_realizadas,
      };
    });

  // 👇 Mapeo limpio del tutor asignado en la entidad receptora
  const tutorEntidad = primerRegistro.tutor_entidad && primerRegistro.tutor_entidad.trim() !== ''
    ? primerRegistro.tutor_entidad.trim()
    : 'Sin Tutor Receptora Asignado';

  return {
    cabecera: {
      carrera: primerRegistro.carrera,
      entidad_beneficiaria: primerRegistro.entidad_beneficiaria,
      estudiante: `${primerRegistro.est_nombres || ''} ${primerRegistro.est_apellidos || ''}`.trim(),
      nombre_proyecto: primerRegistro.nombre_proyecto,
      docente_tutor: `${primerRegistro.doc_nombres || ''} ${primerRegistro.doc_apellidos || ''}`.trim(),
      tutor_entidad_receptora: tutorEntidad,
      periodo_academico: primerRegistro.periodo_academico,
    },
    actividades: actividades,
    totales: {
      total_horas: parseFloat(primerRegistro.total_horas_estudiante || 0),
      observaciones: primerRegistro.observacion_reporte || 'Ninguna',
    },
  };
}

 async obtenerReporteAsistenciaTutor(idVinculacion: number) {
  const resultados = await this.repository.obtainReporteAsistenciaTutorRaw(idVinculacion);

  // 1. Si no hay registros en la BD, retorna null directamente
  if (!resultados || resultados.length === 0) {
    return null;
  }

  const primerRegistro = resultados[0];
  let totalHorasAcumuladas = 0;

  const actividades = resultados
    .filter((row: any) => row.fecha !== null)
    .map((row: any) => {
      const fechaParseada = new Date(row.fecha);
      const fechaFormateada = !isNaN(fechaParseada.getTime())
        ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
        : row.fecha;

      const horas = parseFloat(row.horas_total || 0);
      totalHorasAcumuladas += horas;

      return {
        fecha: fechaFormateada,
        hora_entrada: row.hora_inicio,
        hora_salida: row.hora_fin,
        total_horas: horas,
        actividad_realizada: row.actividades_realizadas,
      };
    });

  const coordinador = primerRegistro.coordinador_carrera?.trim();

  return {
    cabecera: {
      carrera: primerRegistro.carrera,
      institucion: primerRegistro.entidad_beneficiaria,
      docente_tutor: primerRegistro.docente_tutor,
      periodo_academico: primerRegistro.periodo_academico,
    },
    actividades: actividades,
    totales: {
      suma_total_horas: totalHorasAcumuladas,
      observaciones: primerRegistro.observacion_reporte || 'Ninguna',
      coordinador_carrera: (coordinador && coordinador !== '') ? coordinador : 'Sin Coordinador Asignado',
    },
  };
}
  async obtenerInformeActividades(idVinculacion: number) {
  const resultados = await this.repository.obtainInformeActividadesRaw(idVinculacion);

  // 1. Si no hay registros en la BD, retorna null directamente
  if (!resultados || resultados.length === 0) {
    return null;
  }

  const primerRegistro = resultados[0];

  const listaAsignaturas = primerRegistro.asignaturas
    ? primerRegistro.asignaturas.split(' | ')
    : [];

  const actividades = resultados
    .filter((row: any) => row.fecha !== null)
    .map((row: any) => {
      const fechaParseada = new Date(row.fecha);
      const fechaFormateada = !isNaN(fechaParseada.getTime())
        ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
        : row.fecha;

      return {
        fecha: fechaFormateada,
        actividad: row.actividades_realizadas,
        // 2. Traído dinámicamente desde la BD:
        resultado_aprendizaje: row.resultado_aprendizaje || 'Sin resultado de aprendizaje especificado',
      };
    });

  const formatFechaCabecera = (f: any) => {
    if (!f) return 'N/A';
    const fecha = new Date(f);
    return !isNaN(fecha.getTime())
      ? fecha.toLocaleDateString('es-ES', { timeZone: 'UTC' })
      : 'N/A';
  };

  return {
    cabecera: {
      fundacion: primerRegistro.entidad_beneficiaria,
      nivel: primerRegistro.nivel || 'N/A',
      estudiante: primerRegistro.estudiante,
      cedula: primerRegistro.cedula_identidad,
      ciclo_academico: primerRegistro.ciclo_academico,
      asignatura_1: listaAsignaturas[0] || 'N/A',
      asignatura_2: listaAsignaturas[1] || 'N/A',
      inicia: formatFechaCabecera(primerRegistro.inicia),
      finaliza: formatFechaCabecera(primerRegistro.finaliza),
      docente_tutor: primerRegistro.docente_tutor,
      titulo_proyecto: primerRegistro.nombre_proyecto,
    },
    informe_actividades: actividades,
  };
}
 async obtenerInformeFinal(idVinculacion: number) {
    // Asegúrate de llamar a este método de acuerdo a cómo lo tengas en tu arquitectura (this.repository o similar)
    const resultados = await this.repository.obtainInformeFinalRaw(idVinculacion);

    if (!resultados || resultados.length === 0) {
      return null;
    }

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
      if (decimal > 0) {
        texto += ` con ${decimal}/100`;
      }
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

    // 👇 AHORA TRAERÁN LOS DATOS REALES DE "Empresa Tecnológica S.A." Y "Ing. Carlos Mendoza"
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
      
      // 👇 Estos campos ahora tomarán automáticamente la data de las subconsultas SQL
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

 async obtenerCertificadoVinculacion(idVinculacion: number) {
  const data = await this.repository.obtainCertificadoVinculacionRaw(idVinculacion);

  if (!data) {
    throw new NotFoundException(`No se encontró información para generar el certificado con ID ${idVinculacion}`);
  }

  const formatearFechaLarga = (fechaStr: string) => {
    if (!fechaStr) return 'Fecha no registrada';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const fechaEmision = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });

  return {
    fecha_emision: `Quito, ${fechaEmision}`,
    estudiante: data.estudiante,
    cedula: data.cedula,
    carrera: data.carrera,
    proyecto: data.proyecto || data.nombre_proyecto,
    fecha_inicio: formatearFechaLarga(data.fecha_inicio),
    fecha_fin: formatearFechaLarga(data.fecha_fin),
    total_horas: data.total_horas_estudiante || 0,
    institucion: data.institucion,
    
    // 👇 Muestra el tutor de la entidad receptora si existe, de lo contrario la autoridad predeterminada
    representante: data.representante || "BARRIGA OLIVO SUSAN JACQUELINE"
  };
}
}