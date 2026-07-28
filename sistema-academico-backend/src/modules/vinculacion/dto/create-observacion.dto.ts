import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, IsIn } from 'class-validator';

export class CreateObservacionDto {
  @IsNumber()
  @IsNotEmpty()
  id_vinculacion: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  // 👇 Le decimos a NestJS que solo acepte los valores exactos de la base de datos
  @IsIn(['INFORME_FINAL', 'ASISTENCIA_TUTOR', 'ASISTENCIA_ESTUDIANTE'], {
    message: 'El tipo_reporte no es válido. Debe ser: INFORME_FINAL, ASISTENCIA_TUTOR o ASISTENCIA_ESTUDIANTE'
  })
  tipo_reporte?: string;

  @IsString()
  @IsOptional()
  observacion?: string;
}