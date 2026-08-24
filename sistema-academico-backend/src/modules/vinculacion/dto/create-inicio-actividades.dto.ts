import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateInicioActividadesDto {
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
  @IsString()
  nombre_proyecto: string;

  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString()
  fecha_inicio: string;

  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  @IsDateString()
  fecha_fin: string;
}