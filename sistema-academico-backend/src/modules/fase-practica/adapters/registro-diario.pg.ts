import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { REGISTRO_DIARIO_REPOSITORY, IRegistroDiarioRepository } from '../ports/registro-diario.repository.port';

@Injectable()
export class RegistroDiarioPg implements IRegistroDiarioRepository {
  constructor(
    @InjectRepository(RegistroDiarioEntity)
    private readonly registroDiarioRepository: Repository<RegistroDiarioEntity>,
  ) {}

  async create(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = this.registroDiarioRepository.create(dto);
    return this.registroDiarioRepository.save(registro);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<RegistroDiarioEntity[]> {
    return this.registroDiarioRepository.find({ where: { id_practica: idPractica }, skip, take });
  }

  async findById(id: number): Promise<RegistroDiarioEntity | null> {
    return this.registroDiarioRepository.findOne({ where: { id_registro_diario: id } });
  }

  async update(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = await this.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    Object.assign(registro, dto);
    return this.registroDiarioRepository.save(registro);
  }

  async remove(id: number): Promise<void> {
    const registro = await this.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    await this.registroDiarioRepository.remove(registro);
  }

  async createWithRecalculoHoras(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = this.registroDiarioRepository.create(dto);
    const guardado = await this.registroDiarioRepository.save(registro);
    await this.recalcularHorasCumplidas(dto.id_practica);
    return guardado;
  }

  async updateWithRecalculoHoras(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = await this.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    Object.assign(registro, dto);
    const guardado = await this.registroDiarioRepository.save(registro);
    await this.recalcularHorasCumplidas(guardado.id_practica);
    return guardado;
  }

  async removeWithRecalculoHoras(id: number): Promise<void> {
    const registro = await this.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    const idPractica = registro.id_practica;
    await this.registroDiarioRepository.remove(registro);
    await this.recalcularHorasCumplidas(idPractica);
  }

  private async recalcularHorasCumplidas(idPractica: number): Promise<void> {
    const registros = await this.findByPractica(idPractica);
    let totalMinutos = 0;
    for (const r of registros) {
      const ingreso = this.toMinutes(r.hora_ingreso);
      const salida = this.toMinutes(r.hora_salida);
      const almuerzoIn = this.toMinutes(r.hora_salida_almuerzo);
      const almuerzoOut = this.toMinutes(r.hora_regreso_almuerzo);
      if (ingreso !== null && salida !== null) {
        let minutos = salida - ingreso;
        if (almuerzoIn !== null && almuerzoOut !== null) {
          minutos -= almuerzoOut - almuerzoIn;
        }
        totalMinutos += Math.max(0, minutos);
      }
    }
    const horasEnteras = Math.round(totalMinutos / 60);
    await this.registroDiarioRepository.manager.update(
      'practica_estudiante',
      { id_practica: idPractica },
      { total_horas_cumplidas: horasEnteras },
    );
  }

  private toMinutes(hhmm?: string): number | null {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }
}
