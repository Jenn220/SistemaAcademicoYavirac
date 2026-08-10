import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { 
  VINCULACION_INICIO_ACTIVIDADES_PORT, 
  IVinculacionInicioActividadesPort 
} from '../ports/inicio-actividades-tutor.port';
import { UpdateInicioActividadesDto } from '../dto/update-inicio-actividades.dto';

@Injectable()
export class InicioActividadesTutorService {
  constructor(
    @Inject(VINCULACION_INICIO_ACTIVIDADES_PORT) 
    private readonly repository: IVinculacionInicioActividadesPort,
  ) {}

  async obtenerIniciosActividadesPorDocente(idDocente: number) {
    return await this.repository.obtenerIniciosActividadesPorDocenteRaw(idDocente);
  }

  async obtenerInicioActividadesTutor(idVinculacion: number) {
  const data = await this.repository.obtainInicioActividadesTutorRaw(idVinculacion);
  if (!data) return null;

  const coordinador = data.coordinador?.trim();
  
  return {
    coordinador: (coordinador && coordinador !== '') ? coordinador : 'Sin Coordinador Asignado',
    tutor_nombre: data.tutor_nombre,
    tutor_cedula: data.tutor_cedula,
    proyecto_nombre: data.proyecto_nombre,
    // 👇 Agregamos estas dos líneas:
    fecha_inicio: data.fecha_proyecto ? new Date(data.fecha_proyecto).toISOString() : null,
    fecha_fin: data.fecha_fin ? new Date(data.fecha_fin).toISOString() : null, 
    carrera: data.carrera,
    entidad_beneficiaria: data.entidad_beneficiaria,
    tutor_entidad: data.tutor_entidad || 'Sin Tutor Receptora Asignado',
    descripcion_actividades: data.descripcion_actividades || '',
  };
}

  // 🟢 Método exclusivo para actualizar (ya sin fechas)
  async actualizarInicioActividadesTutor(idVinculacion: number, dto: UpdateInicioActividadesDto) {
    const registroExistente = await this.repository.obtainInicioActividadesTutorRaw(idVinculacion);
    if (!registroExistente) {
      throw new NotFoundException(`No existe el registro de vinculación con ID ${idVinculacion}`);
    }
    await this.repository.actualizarInicioActividadesRaw(idVinculacion, dto);
    return await this.obtenerInicioActividadesTutor(idVinculacion);
  }
  async actualizarFechaFinProyecto(idVinculacion: number, nuevaFechaFin: string) {
  // Aquí delegamos al repositorio para actualizar el campo fecha_fin
  await this.repository.actualizarFechaFin(idVinculacion, nuevaFechaFin);
  return { message: "Fecha de finalización actualizada correctamente" };
}
}