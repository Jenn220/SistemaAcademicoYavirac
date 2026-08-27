import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { ControlPeriodosService } from './control-periodos.service';

import { CerrarPeriodoDto } from './dto/cerrar-periodo.dto';
import { ConsultarPeriodosDto } from './dto/consultar-periodos.dto';
import { CrearPeriodoCarreraDto } from './dto/crear-periodo-carrera.dto';
import { ReasignarCoordinadorDto } from './dto/reasignar-coordinador.dto';

@Controller('periodo-carrera')
@UseGuards(JwtGuard, RolesGuard)
@Roles('COORDINADOR')
export class ControlPeriodosController {
  constructor(
    private readonly controlPeriodosService: ControlPeriodosService,
  ) {}

  @Get('catalogos')
  obtenerCatalogosCreacion(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.obtenerCatalogosCreacion(
      request.user,
    );
  }

  @Post()
  crearPeriodoCarrera(
    @Body() dto: CrearPeriodoCarreraDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.crearPeriodoCarrera(
      request.user,
      dto,
    );
  }

  @Get()
  obtenerPeriodos(
    @Query() filtros: ConsultarPeriodosDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.obtenerPeriodosDelCoordinador(
      request.user,
      filtros,
    );
  }

  @Get(':id/resumen-cierre')
  obtenerResumenCierre(
    @Param('id', ParseIntPipe) idPeriodoCarrera: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.obtenerResumenCierre(
      idPeriodoCarrera,
      request.user,
    );
  }

  @Get(':id/coordinadores-disponibles')
  obtenerCoordinadoresDisponibles(
    @Param('id', ParseIntPipe) idPeriodoCarrera: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.obtenerCoordinadoresDisponibles(
      idPeriodoCarrera,
      request.user,
    );
  }

  @Get(':id/historial')
  obtenerHistorial(
    @Param('id', ParseIntPipe) idPeriodoCarrera: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.obtenerHistorial(
      idPeriodoCarrera,
      request.user,
    );
  }

  @Post(':id/cerrar')
  cerrarPeriodo(
    @Param('id', ParseIntPipe) idPeriodoCarrera: number,
    @Body() dto: CerrarPeriodoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.cerrarPeriodo(
      idPeriodoCarrera,
      request.user,
      dto,
    );
  }

  @Patch(':id/coordinador')
  reasignarCoordinador(
    @Param('id', ParseIntPipe) idPeriodoCarrera: number,
    @Body() dto: ReasignarCoordinadorDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.controlPeriodosService.reasignarCoordinador(
      idPeriodoCarrera,
      request.user,
      dto,
    );
  }
}