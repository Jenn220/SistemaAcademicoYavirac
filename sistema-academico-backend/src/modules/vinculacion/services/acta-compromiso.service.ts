import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { 
  VINCULACION_ACTA_PORT, 
  IVinculacionActaPort 
} from '../ports/acta-compromiso.port';

@Injectable()
export class ActaCompromisoService {
  constructor(
    @Inject(VINCULACION_ACTA_PORT) 
    private readonly repository: IVinculacionActaPort,
  ) {}

  async obtenerActaCompromiso(idVinculacion: number) {
    try {
      const data = await this.repository.obtainActaCompromisoRaw(idVinculacion);
      if (!data) return null;

      return {
        titulo: "ACTA COMPROMISO DE PARTICIPACIÓN EN VINCULACIÓN CON LA COMUNIDAD",
        instituto: 'Instituto Superior Tecnológico de Turismo y Patrimonio "YAVIRAC"',
        estudiante: data.estudiante,
        cedula: data.cedula_identidad,
        carrera: data.carrera,
        nivel: data.nivel || "Tercero",
        entidad_beneficiaria: data.entidad_beneficiaria,
        docente_tutor: data.docente_tutor || "Sin Docente Asignado",
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener el acta de compromiso para vinculación ${idVinculacion}: ${mensaje}`
      );
    }
  }
}