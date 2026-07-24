import { IsNumber, IsDateString, IsString, IsOptional } from 'class-validator';

export class UpdateInformeDto {
  @IsOptional()
  @IsNumber()
  idVinculacion?: number;

  @IsOptional()
  @IsDateString()
  fechaInforme?: string;

  @IsOptional()
  @IsString()
  actividadMacro?: string;

  @IsOptional()
  @IsString()
  resultadoAprendizaje?: string;
}