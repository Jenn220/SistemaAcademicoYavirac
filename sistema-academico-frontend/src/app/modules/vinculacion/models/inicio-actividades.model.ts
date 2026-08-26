export interface InicioActividadesResponse {
  coordinador: string;
  tutor_nombre: string;
  tutor_cedula: string;
  proyecto_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  carrera: string;
  entidad_beneficiaria: string;
  tutor_entidad: string;
  descripcion_actividades: string;
  editado: boolean;  // 🔥 AGREGADO
}

export interface UpdateInicioActividadesDto {
  nombre_proyecto?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}