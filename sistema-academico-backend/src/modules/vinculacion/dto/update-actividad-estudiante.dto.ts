import { IsString, IsDateString, IsOptional, IsNumber, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateActividadEstudianteDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El id_vinculacion debe ser un número válido.' })
  id_vinculacion?: number; // 👈 Agregado para corregir el error ts(2339)

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (AAAA-MM-DD).' })
  fecha?: string; 

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora_inicio debe tener un formato válido HH:mm o HH:mm:ss',
  })
  hora_inicio?: string; 

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora_fin debe tener un formato válido HH:mm o HH:mm:ss',
  })
  hora_fin?: string; 

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El total de horas debe ser un número.' })
  horas_total?: number; 

 @IsOptional()
  @IsString()
  actividades_realizadas?: string;
  
  @IsOptional()
  @IsString()
  resultado_aprendizaje?: string;
}