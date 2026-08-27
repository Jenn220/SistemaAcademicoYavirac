import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInformeAprendizajeDto {
  @IsNumber()
  @Min(1)
  id_practica!: number;

  @IsOptional()
  @IsString()
  reflexion_aprendizaje?: string;

  @IsOptional()
  @IsString()
  observaciones_empresa?: string;
}
