import { CreateCvPracticaDualDto } from '../dto/create-cv-practica-dual.dto';
import { UpdateCvPracticaDualDto } from '../dto/update-cv-practica-dual.dto';
import { CvPracticaDualResponseDto } from '../dto/cv-practica-dual-response.dto';

export const CV_PRACTICA_DUAL_REPOSITORY = 'CvPracticaDualRepository';

export interface ICvPracticaDualRepository {
  create(dto: CreateCvPracticaDualDto, idEstudiante: number): Promise<CvPracticaDualResponseDto>;
  findByEstudiante(idEstudiante: number): Promise<CvPracticaDualResponseDto[]>;
  findOne(id: number): Promise<CvPracticaDualResponseDto | null>;
  update(id: number, dto: UpdateCvPracticaDualDto): Promise<CvPracticaDualResponseDto>;
  remove(id: number): Promise<void>;
}
