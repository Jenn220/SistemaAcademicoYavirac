import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import { UpdatePracticaDto } from '../dto/update-practica.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';
import { PracticaService } from '../services/practica.service';

@Controller('fase-practica')
export class PracticaController {
  constructor(private readonly practicaService: PracticaService) {}

  @Post('practicas')
  createPractica(@Body() dto: CreatePracticaDto) {
    return this.practicaService.createPractica(dto);
  }

  @Get('practicas')
  findAllPracticas(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findAllPracticas(skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Get('practicas/:id')
  findPracticaById(@Param('id') id: string) {
    return this.practicaService.findPracticaById(Number(id));
  }

  @Patch('practicas/:id')
  updatePractica(@Param('id') id: string, @Body() dto: UpdatePracticaDto) {
    return this.practicaService.updatePractica(Number(id), dto);
  }

  @Delete('practicas/:id')
  removePractica(@Param('id') id: string) {
    return this.practicaService.removePractica(Number(id)).then(() => ({
      deleted: true,
      id_practica: Number(id),
    }));
  }

  @Post('registro-diario')
  createRegistroDiario(@Body() dto: CreateRegistroDiarioDto) {
    return this.practicaService.createRegistroDiario(dto);
  }

  @Get('registro-diario/practica/:id')
  findRegistrosByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findRegistrosByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('registro-diario/:id')
  updateRegistroDiario(@Param('id') id: string, @Body() dto: UpdateRegistroDiarioDto) {
    return this.practicaService.updateRegistroDiario(Number(id), dto);
  }

  @Delete('registro-diario/:id')
  removeRegistroDiario(@Param('id') id: string) {
    return this.practicaService.removeRegistroDiario(Number(id)).then(() => ({
      deleted: true,
      id_registro_diario: Number(id),
    }));
  }

  @Post('plan-rotacion')
  createPlanRotacion(@Body() dto: CreatePlanRotacionDto) {
    return this.practicaService.createPlanRotacion(dto);
  }

  @Get('plan-rotacion/practica/:id')
  findPlanRotacionByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findPlanRotacionByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('plan-rotacion/:id')
  updatePlanRotacion(@Param('id') id: string, @Body() dto: UpdatePlanRotacionDto) {
    return this.practicaService.updatePlanRotacion(Number(id), dto);
  }

  @Delete('plan-rotacion/:id')
  removePlanRotacion(@Param('id') id: string) {
    return this.practicaService.removePlanRotacion(Number(id)).then(() => ({
      deleted: true,
      id_plan_rotacion: Number(id),
    }));
  }

  @Post('informe-aprendizaje')
  createInformeAprendizaje(@Body() dto: CreateInformeAprendizajeDto) {
    return this.practicaService.createInformeAprendizaje(dto);
  }

  @Get('informe-aprendizaje/practica/:id')
  findInformesByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findInformesByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('informe-aprendizaje/:id')
  updateInformeAprendizaje(@Param('id') id: string, @Body() dto: UpdateInformeAprendizajeDto) {
    return this.practicaService.updateInformeAprendizaje(Number(id), dto);
  }

  @Delete('informe-aprendizaje/:id')
  removeInformeAprendizaje(@Param('id') id: string) {
    return this.practicaService.removeInformeAprendizaje(Number(id)).then(() => ({
      deleted: true,
      id_informe: Number(id),
    }));
  }

  @Post('evaluacion')
  createEvaluacion(@Body() dto: CreateEvaluacionPracticaDto) {
    return this.practicaService.createEvaluacionPractica(dto);
  }

  @Get('evaluacion/practica/:id')
  findEvaluacionesByPractica(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findEvaluacionesByPractica(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('evaluacion/:id')
  updateEvaluacion(@Param('id') id: string, @Body() dto: UpdateEvaluacionPracticaDto) {
    return this.practicaService.updateEvaluacionPractica(Number(id), dto);
  }

  @Delete('evaluacion/:id')
  removeEvaluacion(@Param('id') id: string) {
    return this.practicaService.removeEvaluacionPractica(Number(id)).then(() => ({
      deleted: true,
      id_evaluacion: Number(id),
    }));
  }

  @Post('bitacora-semanal')
  createBitacoraSemanal(@Body() dto: CreateBitacoraSemanalDto) {
    return this.practicaService.createBitacoraSemanal(dto);
  }

  @Get('bitacora-semanal/informe/:id')
  findBitacorasByInforme(@Param('id') id: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findBitacorasByInforme(Number(id), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('bitacora-semanal/:id')
  updateBitacoraSemanal(@Param('id') id: string, @Body() dto: UpdateBitacoraSemanalDto) {
    return this.practicaService.updateBitacoraSemanal(Number(id), dto);
  }

  @Delete('bitacora-semanal/:id')
  removeBitacoraSemanal(@Param('id') id: string) {
    return this.practicaService.removeBitacoraSemanal(Number(id)).then(() => ({
      deleted: true,
      id_bitacora: Number(id),
    }));
  }

  @Post('rubrica')
  createRubrica(@Body() dto: CreateRubricaDto) {
    return this.practicaService.createRubrica(dto);
  }

  @Get('rubrica')
  findAllRubricas(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.practicaService.findAllRubricas(skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Patch('rubrica/:id')
  updateRubrica(@Param('id') id: string, @Body() dto: UpdateRubricaDto) {
    return this.practicaService.updateRubrica(Number(id), dto);
  }

  @Delete('rubrica/:id')
  removeRubrica(@Param('id') id: string) {
    return this.practicaService.removeRubrica(Number(id)).then(() => ({
      deleted: true,
      id_rubrica: Number(id),
    }));
  }
}
