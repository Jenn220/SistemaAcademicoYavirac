import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RubricaService } from '../services/rubrica.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class RubricaController {
  constructor(private readonly rubricaService: RubricaService) {}

  @Post('rubricas')
  @Roles('DOCENTE', 'COORDINADOR')
  create(@Body() dto: CreateRubricaDto) {
    return this.rubricaService.create(dto);
  }

  @Get('rubricas')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.rubricaService.findAll(skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Get('rubricas/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findById(@Param('id') id: string) {
    return this.rubricaService.findById(Number(id));
  }

  @Patch('rubricas/:id')
  @Roles('DOCENTE', 'COORDINADOR')
  update(@Param('id') id: string, @Body() dto: UpdateRubricaDto) {
    return this.rubricaService.update(Number(id), dto);
  }

  @Delete('rubricas/:id')
  @Roles('DOCENTE', 'COORDINADOR')
  remove(@Param('id') id: string) {
    return this.rubricaService.remove(Number(id)).then(() => ({ deleted: true, id_rubrica: Number(id) }));
  }
}
