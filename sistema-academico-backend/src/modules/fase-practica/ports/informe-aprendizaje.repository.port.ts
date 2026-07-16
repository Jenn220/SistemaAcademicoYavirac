import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { CreateInformeAprendizajeDto } from '../dto/create-informe-aprendizaje.dto';
import { UpdateInformeAprendizajeDto } from '../dto/update-informe-aprendizaje.dto';

export const INFORME_APRENDIZAJE_REPOSITORY = 'InformeAprendizajeRepository';

export interface IInformeAprendizajeRepository {
  create(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity>;
  findByPractica(idPractica: number, skip?: number, take?: number): Promise<InformeAprendizajeEntity[]>;
  findById(id: number): Promise<InformeAprendizajeEntity | null>;
  update(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity>;
  remove(id: number): Promise<void>;
}
