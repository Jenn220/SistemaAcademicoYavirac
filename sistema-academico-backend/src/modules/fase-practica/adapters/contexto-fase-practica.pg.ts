import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from '../domain/estudiante.entity';
import { EmpresaEntity } from '../domain/empresa.entity';
import { PracticaEntity } from '../domain/practica.entity';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { DocumentoEntity } from '../domain/documento.entity';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { CONTEXTO_FASE_PRACTICA_REPOSITORY, IContextoFasePracticaRepository } from '../ports/contexto-fase-practica.port';

@Injectable()
export class ContextoFasePracticaPg implements IContextoFasePracticaRepository {
  constructor(
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepository: Repository<EmpresaEntity>,
    @InjectRepository(PracticaEntity)
    private readonly practicaRepository: Repository<PracticaEntity>,
    @InjectRepository(RegistroDiarioEntity)
    private readonly registroDiarioRepository: Repository<RegistroDiarioEntity>,
    @InjectRepository(InformeAprendizajeEntity)
    private readonly informeRepository: Repository<InformeAprendizajeEntity>,
    @InjectRepository(BitacoraSemanalEntity)
    private readonly bitacoraRepository: Repository<BitacoraSemanalEntity>,
    @InjectRepository(DocumentoEntity)
    private readonly documentoRepository: Repository<DocumentoEntity>,
    @InjectRepository(PlanRotacionEntity)
    private readonly planRotacionRepository: Repository<PlanRotacionEntity>,
  ) {}

  async obtenerContextoPorEstudiante(idEstudiante: number): Promise<any> {
    const estudiante = await this.estudianteRepository.findOne({ where: { id_estudiante: idEstudiante } });
    const practicas = await this.practicaRepository.find();

    return {
      estudiante,
      practicas,
    };
  }

  async obtenerResumenGeneral(idEstudiante: number): Promise<any> {
    const practicas = await this.practicaRepository.find();

    const resumen = await Promise.all(
      practicas.map(async (practica) => {
        const registros = await this.registroDiarioRepository.find({ where: { id_practica: practica.id_practica } });
        const informes = await this.informeRepository.find({ where: { id_practica: practica.id_practica } });
        const documentos = await this.documentoRepository.find();
        const planes = await this.planRotacionRepository.find({ where: { id_practica: practica.id_practica } });

        return {
          practica,
          totalRegistros: registros.length,
          totalInformes: informes.length,
          totalDocumentos: documentos.length,
          totalPlanes: planes.length,
        };
      }),
    );

    return resumen;
  }
}
