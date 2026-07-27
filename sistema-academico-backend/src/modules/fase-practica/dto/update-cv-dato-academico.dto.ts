import { IsOptional, IsString } from 'class-validator';

export class UpdateCvDatoAcademicoDto {
  @IsOptional()
  @IsString()
  anio?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  titulo_mencion?: string;

  @IsOptional()
  @IsString()
  nota_final?: string;
}
