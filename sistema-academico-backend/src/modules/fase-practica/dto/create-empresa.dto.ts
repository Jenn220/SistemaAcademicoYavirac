import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @MaxLength(20)
  ruc!: string;

  @IsString()
  @MaxLength(200)
  razon_social!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;
}

