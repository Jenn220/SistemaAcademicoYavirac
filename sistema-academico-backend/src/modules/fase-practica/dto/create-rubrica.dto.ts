import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRubricaDto {
  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsString()
  @MaxLength(100)
  tipo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;
}
