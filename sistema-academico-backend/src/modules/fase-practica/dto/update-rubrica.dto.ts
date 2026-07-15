import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRubricaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;
}
