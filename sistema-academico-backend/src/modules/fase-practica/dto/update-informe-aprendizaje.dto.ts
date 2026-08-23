import { IsOptional, IsString } from 'class-validator';

export class UpdateInformeAprendizajeDto {
  @IsOptional()
  @IsString()
  reflexion_aprendizaje?: string;

  @IsOptional()
  @IsString()
  observaciones_empresa?: string;
}
