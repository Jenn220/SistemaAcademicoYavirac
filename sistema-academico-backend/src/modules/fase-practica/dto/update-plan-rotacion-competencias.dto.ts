import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlanRotacionCompetenciasDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  conocimientos_teoricos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  procedimentales?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  actitudinales?: string;
}
