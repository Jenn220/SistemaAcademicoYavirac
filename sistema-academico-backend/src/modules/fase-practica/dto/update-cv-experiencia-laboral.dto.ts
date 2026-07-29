import { IsOptional, IsString } from 'class-validator';

export class UpdateCvExperienciaLaboralDto {
  @IsOptional()
  @IsString()
  anio?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  actividades?: string;
}
