export const VINCULACION_INICIO_ACTIVIDADES_PORT = 'VINCULACION_INICIO_ACTIVIDADES_PORT';

export interface IVinculacionInicioActividadesPort {
  obtenerIniciosActividadesPorDocenteRaw(idDocente: number): Promise<any>;
  obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any>;
  actualizarInicioActividadesRaw(
    idVinculacion: number,
    datos: {
      nombre_proyecto?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
    }
  ): Promise<any>;
  actualizarFechaFin(idVinculacion: number, fechaFin: string): Promise<void>;

  // 🔥 NUEVO MÉTODO
  marcarComoEditado(idVinculacion: number): Promise<void>;
}