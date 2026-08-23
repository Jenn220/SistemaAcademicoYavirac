import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlanRotacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  puesto_aprendizaje?: string;
}
