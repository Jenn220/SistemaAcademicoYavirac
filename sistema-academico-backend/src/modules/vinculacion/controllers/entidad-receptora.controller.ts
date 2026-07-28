import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';

import { CreateEntidadReceptoraDto } from '../dto/create-entidad-receptora.dto';
import { EntidadReceptoraService } from '../services/entidad-receptora.service';


@Controller('vinculacion/entidades-receptoras')
export class EntidadReceptoraController {
  constructor(private readonly entidadService: EntidadReceptoraService) {}

  @Post()
  async crearEntidad(@Body() createDto: CreateEntidadReceptoraDto) {
    return this.entidadService.crear(createDto);
  }
  @Get()
  async obtenerTodas() {
    return this.entidadService.obtenerTodas();
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.entidadService.obtenerPorId(id);
  }
}