import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { CreateInformeAprendizajeDto } from '../dto/create-informe-aprendizaje.dto';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { CreatePracticaDto } from '../dto/create-practica.dto';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';
import { UpdateInformeAprendizajeDto } from '../dto/update-informe-aprendizaje.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { UpdatePlanRotacionCompetenciasDto } from '../dto/update-plan-rotacion-competencias.dto';
import { UpdatePracticaDto } from '../dto/update-practica.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';
import { PracticaService } from '../services/practica.service';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('fase-practica')
export class PracticaController {
  constructor(private readonly practicaService: PracticaService) {}

  @Post('practicas')
  createPractica(@Body() dto: CreatePracticaDto) {
    return this.practicaService.createPractica(dto);
  }

  /**
   * DOCENTE solo ve las prácticas donde es el docente asignado (id_docente);
   * TUTOR_EMPRESARIAL solo las de su empresa; COORDINADOR ve todas (es quien
   * asigna). Antes esto devolvía la lista completa a cualquier rol — un
   * docente veía estudiantes de otros profesores.
   */
  @Get('practicas')
  findAllPracticas(@Req() req: any, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findAllPracticas(req.user, skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Get('practicas/:id')
  findPracticaById(@Param('id') id: string) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      throw new BadRequestException('Identificador de práctica inválido.');
    }
    return this.practicaService.findPracticaById(idNum);
  }

  /**
   * Reasignar docente/tutor empresarial de una práctica es exclusivo de
   * COORDINADOR (antes lo podía llamar cualquiera de los 4 roles).
   */
  @Patch('practicas/:id')
  @Roles('COORDINADOR')
  updatePractica(@Param('id') id: string, @Body() dto: UpdatePracticaDto) {
    return this.practicaService.updatePractica(Number(id), dto);
  }

  /** Catálogos de solo lectura para los selects de la pantalla de Asignaciones. */
  @Get('docentes')
  @Roles('COORDINADOR')
  findAllDocentes() {
    return this.practicaService.findAllDocentes();
  }

  @Get('tutores-empresariales')
  @Roles('COORDINADOR')
  findAllTutoresEmpresariales() {
    return this.practicaService.findAllTutoresEmpresariales();
  }

  @Delete('practicas/:id')
  removePractica(@Param('id') id: string) {
    return this.practicaService.removePractica(Number(id)).then(() => ({
      deleted: true,
      id_practica: Number(id),
    }));
  }

  @Post('registro-diario')
  @Roles('ESTUDIANTE')
  createRegistroDiario(@Req() req: any, @Body() dto: CreateRegistroDiarioDto) {
    return this.practicaService.createRegistroDiario(req.user, dto);
  }

  @Get('registro-diario/practica/:id')
  findRegistrosByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findRegistrosByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('registro-diario/:id')
  @Roles('ESTUDIANTE')
  updateRegistroDiario(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRegistroDiarioDto) {
    return this.practicaService.updateRegistroDiario(req.user, Number(id), dto);
  }

  @Delete('registro-diario/:id')
  @Roles('ESTUDIANTE')
  removeRegistroDiario(@Req() req: any, @Param('id') id: string) {
    return this.practicaService.removeRegistroDiario(req.user, Number(id)).then(() => ({
      deleted: true,
      id_registro_diario: Number(id),
    }));
  }

  // Plan de Rotación: solo ESTUDIANTE crea/edita/elimina (sobreescribe el
  // @Roles de la clase); el GET queda abierto a ESTUDIANTE/DOCENTE/
  // COORDINADOR. TUTOR_EMPRESARIAL no tiene ningún rol en este formato
  // (no lo llena ni lo aprueba), así que no se le da acceso ni de lectura.
  @Post('plan-rotacion')
  @Roles('ESTUDIANTE')
  createPlanRotacion(@Req() req: any, @Body() dto: CreatePlanRotacionDto) {
    return this.practicaService.createPlanRotacion(req.user, dto);
  }

  @Get('plan-rotacion/practica/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findPlanRotacionByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findPlanRotacionByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('plan-rotacion/:id')
  @Roles('ESTUDIANTE')
  updatePlanRotacion(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePlanRotacionDto) {
    return this.practicaService.updatePlanRotacion(req.user, Number(id), dto);
  }

  @Delete('plan-rotacion/:id')
  @Roles('ESTUDIANTE')
  removePlanRotacion(@Req() req: any, @Param('id') id: string) {
    return this.practicaService.removePlanRotacion(req.user, Number(id)).then(() => ({
      deleted: true,
      id_plan_rotacion: Number(id),
    }));
  }

  // "Competencias Necesarias" del Plan de Rotación: un solo bloque de texto
  // por práctica. TUTOR_EMPRESARIAL no tiene acceso a Plan de Rotación en
  // absoluto (a diferencia del resto de rutas de plan-rotacion, que sí le
  // dejan consultar).
  @Get('plan-rotacion/competencias/:idPractica')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findCompetenciasRotacion(@Param('idPractica') idPractica: string) {
    return this.practicaService.findCompetenciasRotacion(Number(idPractica));
  }

  @Patch('plan-rotacion/competencias/:idPractica')
  @Roles('ESTUDIANTE')
  upsertCompetenciasRotacion(@Req() req: any, @Param('idPractica') idPractica: string, @Body() dto: UpdatePlanRotacionCompetenciasDto) {
    return this.practicaService.upsertCompetenciasRotacion(req.user, Number(idPractica), dto);
  }

  // Informe de Aprendizaje / Bitácora Semanal: ESTUDIANTE escribe su
  // reflexión y sus bitácoras; TUTOR_EMPRESARIAL escribe
  // observaciones_empresa (mismo registro). DOCENTE/COORDINADOR solo
  // consultan (GET queda abierto a los 4 roles de la clase).
  @Post('informe-aprendizaje')
  @Roles('ESTUDIANTE', 'TUTOR_EMPRESARIAL')
  createInformeAprendizaje(@Req() req: any, @Body() dto: CreateInformeAprendizajeDto) {
    return this.practicaService.createInformeAprendizaje(req.user, dto);
  }

  @Get('informe-aprendizaje/practica/:id')
  findInformesByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findInformesByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('informe-aprendizaje/:id')
  @Roles('ESTUDIANTE', 'TUTOR_EMPRESARIAL')
  updateInformeAprendizaje(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateInformeAprendizajeDto) {
    return this.practicaService.updateInformeAprendizaje(req.user, Number(id), dto);
  }

  @Delete('informe-aprendizaje/:id')
  @Roles('ESTUDIANTE', 'TUTOR_EMPRESARIAL')
  removeInformeAprendizaje(@Req() req: any, @Param('id') id: string) {
    return this.practicaService.removeInformeAprendizaje(req.user, Number(id)).then(() => ({
      deleted: true,
      id_informe: Number(id),
    }));
  }

  @Post('evaluacion')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  createEvaluacion(@Req() req: any, @Body() dto: CreateEvaluacionPracticaDto) {
    return this.practicaService.createEvaluacionPractica(req.user, dto);
  }

  @Get('evaluacion/practica/:id')
  findEvaluacionesByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findEvaluacionesByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('evaluacion/:id')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  updateEvaluacion(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEvaluacionPracticaDto) {
    return this.practicaService.updateEvaluacionPractica(req.user, Number(id), dto);
  }

  @Delete('evaluacion/:id')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  removeEvaluacion(@Req() req: any, @Param('id') id: string) {
    return this.practicaService.removeEvaluacionPractica(req.user, Number(id)).then(() => ({
      deleted: true,
      id_evaluacion: Number(id),
    }));
  }

  @Post('bitacora-semanal')
  @Roles('ESTUDIANTE', 'TUTOR_EMPRESARIAL')
  createBitacoraSemanal(@Req() req: any, @Body() dto: CreateBitacoraSemanalDto) {
    return this.practicaService.createBitacoraSemanal(req.user, dto);
  }

  @Get('bitacora-semanal/informe/:id')
  findBitacorasByInforme(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findBitacorasByInforme(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('bitacora-semanal/:id')
  @Roles('ESTUDIANTE', 'TUTOR_EMPRESARIAL')
  updateBitacoraSemanal(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateBitacoraSemanalDto) {
    return this.practicaService.updateBitacoraSemanal(req.user, Number(id), dto);
  }

  @Delete('bitacora-semanal/:id')
  @Roles('ESTUDIANTE', 'TUTOR_EMPRESARIAL')
  removeBitacoraSemanal(@Req() req: any, @Param('id') id: string) {
    return this.practicaService.removeBitacoraSemanal(req.user, Number(id)).then(() => ({
      deleted: true,
      id_bitacora: Number(id),
    }));
  }

  @Post('rubrica')
  @Roles('DOCENTE')
  createRubrica(@Body() dto: CreateRubricaDto) {
    return this.practicaService.createRubrica(dto);
  }

  @Get('rubrica')
  findAllRubricas(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findAllRubricas(skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('rubrica/:id')
  @Roles('DOCENTE')
  updateRubrica(@Param('id') id: string, @Body() dto: UpdateRubricaDto) {
    return this.practicaService.updateRubrica(Number(id), dto);
  }

  @Delete('rubrica/:id')
  @Roles('DOCENTE')
  removeRubrica(@Param('id') id: string) {
    return this.practicaService.removeRubrica(Number(id)).then(() => ({
      deleted: true,
      id_rubrica: Number(id),
    }));
  }
}
