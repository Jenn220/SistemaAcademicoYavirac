import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsOptional()
  @IsString()
  passwordActual?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  passwordNueva: string;
}
