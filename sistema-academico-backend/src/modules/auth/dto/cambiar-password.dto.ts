import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsOptional()
  @IsString()
  passwordActual?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' })
  passwordNueva: string;
}
