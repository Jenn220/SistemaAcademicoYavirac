import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import {
  ISeguimientoPeaRepository,
  SEGUIMIENTO_PEA_REPOSITORY,
} from '../ports/seguimiento-pea.repository';
import { CreateSeguimientoPeaDto } from '../dto/create-seguimiento-pea.dto';
import { UpdateRepresentanteSeguimientoPeaDto } from '../dto/update-representante-seguimiento-pea.dto';
import { SeguimientoPeaResponseDto } from '../dto/seguimiento-pea-response.dto';

@Injectable()
export class SeguimientoPeaService {
  constructor(
    @Inject(SEGUIMIENTO_PEA_REPOSITORY)
    private readonly seguimientoPeaRepo: ISeguimientoPeaRepository,
  ) {}

  async create(dto: CreateSeguimientoPeaDto): Promise<SeguimientoPeaResponseDto> {
    const yaExiste = await this.seguimientoPeaRepo.existsByOferta(dto.id_oferta_asignatura);
    if (yaExiste) {
      throw new ConflictException(
        'Ya existe un seguimiento PEA generado para esta oferta académica',
      );
    }
    return this.seguimientoPeaRepo.create(dto);
  }

  async getByOferta(idOfertaAsignatura: number): Promise<SeguimientoPeaResponseDto> {
    const seguimiento = await this.seguimientoPeaRepo.findByOferta(idOfertaAsignatura);
    if (!seguimiento) {
      throw new NotFoundException('Seguimiento PEA no encontrado para esta oferta académica');
    }
    return seguimiento;
  }

  async updateRepresentante(
    idSeguimientoPea: number,
    dto: UpdateRepresentanteSeguimientoPeaDto,
  ): Promise<void> {
    return this.seguimientoPeaRepo.updateRepresentante(idSeguimientoPea, dto.id_representante);
  }
}
