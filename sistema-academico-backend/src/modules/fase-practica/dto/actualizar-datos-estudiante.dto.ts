import { IsOptional, IsString } from 'class-validator';

export class ActualizarDatosEstudianteDto {
  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  telefono_emergencia?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;
}
