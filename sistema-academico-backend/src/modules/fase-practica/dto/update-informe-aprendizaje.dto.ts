import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInformeAprendizajeDto {
  @IsOptional()
  @IsNumber()
  id_practica?: number;

  @IsOptional()
  @IsString()
  reflexion_aprendizaje?: string;

  @IsOptional()
  @IsString()
  observaciones_empresa?: string;
}
