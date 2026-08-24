import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateEvaluacionInstitutoDto {
  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  calificacion?: number;
}
