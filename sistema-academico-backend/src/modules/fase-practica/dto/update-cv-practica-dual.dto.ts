import { IsOptional, IsString } from 'class-validator';

export class UpdateCvPracticaDualDto {
  @IsOptional()
  @IsString()
  anio_periodo?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  actividades_realizadas?: string;
}
