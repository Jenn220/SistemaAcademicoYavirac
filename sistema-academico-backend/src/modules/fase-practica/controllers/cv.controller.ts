import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CvService } from '../services/cv.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateCvDatoAcademicoDto } from '../dto/create-cv-dato-academico.dto';
import { UpdateCvDatoAcademicoDto } from '../dto/update-cv-dato-academico.dto';
import { CreateCvExperienciaLaboralDto } from '../dto/create-cv-experiencia-laboral.dto';
import { UpdateCvExperienciaLaboralDto } from '../dto/update-cv-experiencia-laboral.dto';
import { CreateCvPracticaDualDto } from '../dto/create-cv-practica-dual.dto';
import { UpdateCvPracticaDualDto } from '../dto/update-cv-practica-dual.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
@Controller('fase-practica')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get('estudiantes/:idEstudiante/cv/datos-academicos')
  findDatosAcademicos(@Param('idEstudiante') idEstudiante: string) {
    return this.cvService.findDatosAcademicos(Number(idEstudiante));
  }

  @Post('estudiantes/:idEstudiante/cv/datos-academicos')
  createDatoAcademico(@Param('idEstudiante') idEstudiante: string, @Body() dto: CreateCvDatoAcademicoDto) {
    return this.cvService.createDatoAcademico(Number(idEstudiante), dto);
  }

  @Patch('cv/datos-academicos/:id')
  updateDatoAcademico(@Param('id') id: string, @Body() dto: UpdateCvDatoAcademicoDto) {
    return this.cvService.updateDatoAcademico(Number(id), dto);
  }

  @Delete('cv/datos-academicos/:id')
  removeDatoAcademico(@Param('id') id: string) {
    return this.cvService.removeDatoAcademico(Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }

  @Get('estudiantes/:idEstudiante/cv/experiencia-laboral')
  findExperienciasLaborales(@Param('idEstudiante') idEstudiante: string) {
    return this.cvService.findExperienciasLaborales(Number(idEstudiante));
  }

  @Post('estudiantes/:idEstudiante/cv/experiencia-laboral')
  createExperienciaLaboral(@Param('idEstudiante') idEstudiante: string, @Body() dto: CreateCvExperienciaLaboralDto) {
    return this.cvService.createExperienciaLaboral(Number(idEstudiante), dto);
  }

  @Patch('cv/experiencia-laboral/:id')
  updateExperienciaLaboral(@Param('id') id: string, @Body() dto: UpdateCvExperienciaLaboralDto) {
    return this.cvService.updateExperienciaLaboral(Number(id), dto);
  }

  @Delete('cv/experiencia-laboral/:id')
  removeExperienciaLaboral(@Param('id') id: string) {
    return this.cvService.removeExperienciaLaboral(Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }

  @Get('estudiantes/:idEstudiante/cv/practicas-duales')
  findPracticasDuales(@Param('idEstudiante') idEstudiante: string) {
    return this.cvService.findPracticasDuales(Number(idEstudiante));
  }

  @Post('estudiantes/:idEstudiante/cv/practicas-duales')
  createPracticaDual(@Param('idEstudiante') idEstudiante: string, @Body() dto: CreateCvPracticaDualDto) {
    return this.cvService.createPracticaDual(Number(idEstudiante), dto);
  }

  @Patch('cv/practicas-duales/:id')
  updatePracticaDual(@Param('id') id: string, @Body() dto: UpdateCvPracticaDualDto) {
    return this.cvService.updatePracticaDual(Number(id), dto);
  }

  @Delete('cv/practicas-duales/:id')
  removePracticaDual(@Param('id') id: string) {
    return this.cvService.removePracticaDual(Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }
}
