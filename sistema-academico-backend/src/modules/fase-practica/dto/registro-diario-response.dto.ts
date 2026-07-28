export class RegistroDiarioResponseDto {
  id_registro_diario!: number;
  id_practica!: number;
  fecha!: string;
  hora_ingreso!: string;
  hora_salida_almuerzo?: string;
  hora_regreso_almuerzo?: string;
  hora_salida?: string;
  firma_estudiante?: boolean;
}
