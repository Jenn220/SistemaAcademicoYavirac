import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateInicioActividadesDto {
  @IsOptional()
  @IsString()
  nombre_proyecto?: string;
@IsOptional()
  @IsDateString()
  fecha_fin?: string; // 👈 Asegúrate de que esté declarado aquí

}