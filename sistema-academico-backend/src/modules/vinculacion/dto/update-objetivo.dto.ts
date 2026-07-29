import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateObjetivoDto {
  @IsOptional()
  @IsNumber()
  idVinculacion?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}