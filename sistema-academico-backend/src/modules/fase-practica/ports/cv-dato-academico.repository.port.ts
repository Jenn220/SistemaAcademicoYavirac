import { CreateCvDatoAcademicoDto } from '../dto/create-cv-dato-academico.dto';
import { UpdateCvDatoAcademicoDto } from '../dto/update-cv-dato-academico.dto';
import { CvDatoAcademicoResponseDto } from '../dto/cv-dato-academico-response.dto';

export const CV_DATO_ACADEMICO_REPOSITORY = 'CvDatoAcademicoRepository';

export interface ICvDatoAcademicoRepository {
  create(dto: CreateCvDatoAcademicoDto, idEstudiante: number): Promise<CvDatoAcademicoResponseDto>;
  findByEstudiante(idEstudiante: number): Promise<CvDatoAcademicoResponseDto[]>;
  findOne(id: number): Promise<CvDatoAcademicoResponseDto | null>;
  update(id: number, dto: UpdateCvDatoAcademicoDto): Promise<CvDatoAcademicoResponseDto>;
  remove(id: number): Promise<void>;
}
