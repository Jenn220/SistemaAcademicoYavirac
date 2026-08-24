export class BitacoraSemanalResponseDto {
  id_bitacora!: number;
  id_informe!: number;
  semana!: number;
  fecha_inicio_semana!: string;
  fecha_fin_semana!: string;
  puesto_aprendizaje?: string;
  actividades_realizadas?: string;
  actividades_autonomas?: string;
}
