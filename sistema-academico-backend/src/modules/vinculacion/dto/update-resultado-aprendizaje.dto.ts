import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateResultadoAprendizajeDto {
  @IsString()
  @IsNotEmpty({ message: 'El resultado de aprendizaje es obligatorio.' })
  resultado_aprendizaje: string;
}