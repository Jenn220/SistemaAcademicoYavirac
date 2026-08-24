import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateActividadEstudianteDto {
  @IsOptional()
  @IsNumber()
  id_vinculacion?: number;

  @IsNotEmpty()
  @IsString()
  fecha: string;

  @IsNotEmpty()
  @IsString()
  hora_inicio: string;

  @IsNotEmpty()
  @IsString()
  hora_fin: string;

  @IsNotEmpty()
  @IsString()
  actividades_realizadas: string;
@IsOptional()
  @IsString()
  observacion?: string;
  // 🟢 Importante: Marcar como opcional para que la validación del DTO lo ignore
  @IsOptional()
  @IsString()
  resultado_aprendizaje?: string;
}