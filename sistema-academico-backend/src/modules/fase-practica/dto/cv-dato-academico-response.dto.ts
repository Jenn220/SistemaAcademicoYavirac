export class CvDatoAcademicoResponseDto {
  id_cv_dato_academico!: number;
  id_estudiante!: number;
  anio!: string;
  institucion!: string;
  titulo_mencion!: string;
  nota_final?: number;
}
