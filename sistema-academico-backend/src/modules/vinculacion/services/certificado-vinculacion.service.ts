import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { 
  CERTIFICADO_VINCULACION_PORT, 
  ICertificadoVinculacionPort 
} from '../ports/certificado-vinculacion.port';

@Injectable()
export class CertificadoVinculacionService {
  constructor(
    @Inject(CERTIFICADO_VINCULACION_PORT) 
    private readonly repository: ICertificadoVinculacionPort,
  ) {}

  async obtenerCertificadoVinculacion(idVinculacion: number) {
    const data = await this.repository.obtainCertificadoVinculacionRaw(idVinculacion);

    if (!data) {
      throw new NotFoundException(`No se encontró información para el certificado con ID ${idVinculacion}`);
    }

    const formatearFechaLarga = (fechaStr: string) => {
      if (!fechaStr) return 'Fecha no registrada';
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    };

    const fechaEmision = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

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
      representante: data.representante || "BARRIGA OLIVO SUSAN JACQUELINE"
    };
  }
}