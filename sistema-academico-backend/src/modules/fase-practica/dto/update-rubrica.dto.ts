import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRubricaDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string;
}
