import { IsOptional, IsString } from 'class-validator';

export class FichaGeneralDto {
  @IsOptional()
  @IsString()
  telefono_emergencia?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsString()
  direccion_empresa?: string;
}

export class UpdateFichaGeneralDto {
  @IsOptional()
  @IsString()
  telefono_emergencia?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsString()
  direccion_empresa?: string;
}
