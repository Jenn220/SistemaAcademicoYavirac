import { CreateCvExperienciaLaboralDto } from '../dto/create-cv-experiencia-laboral.dto';
import { UpdateCvExperienciaLaboralDto } from '../dto/update-cv-experiencia-laboral.dto';
import { CvExperienciaLaboralResponseDto } from '../dto/cv-experiencia-laboral-response.dto';

export const CV_EXPERIENCIA_LABORAL_REPOSITORY = 'CvExperienciaLaboralRepository';

export interface ICvExperienciaLaboralRepository {
  create(dto: CreateCvExperienciaLaboralDto, idEstudiante: number): Promise<CvExperienciaLaboralResponseDto>;
  findByEstudiante(idEstudiante: number): Promise<CvExperienciaLaboralResponseDto[]>;
  findOne(id: number): Promise<CvExperienciaLaboralResponseDto | null>;
  update(id: number, dto: UpdateCvExperienciaLaboralDto): Promise<CvExperienciaLaboralResponseDto>;
  remove(id: number): Promise<void>;
}
