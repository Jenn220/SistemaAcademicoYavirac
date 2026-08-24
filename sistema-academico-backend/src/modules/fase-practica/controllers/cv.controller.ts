import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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
@Controller('fase-practica')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  /**
   * ESTUDIANTE solo puede ver/editar su propio CV: ignora el :idEstudiante de la
   * URL y siempre resuelve contra el JWT. DOCENTE/COORDINADOR sí pueden consultar
   * el CV de cualquier estudiante (para revisión), por eso conservan el param.
   */
  private resolverIdEstudianteLectura(req: any, idEstudianteUrl: string): number {
    if (req.user.roles?.includes('ESTUDIANTE')) {
      if (!req.user.idEstudiante) {
        throw new ForbiddenException('El usuario no tiene un estudiante asociado.');
      }
      return req.user.idEstudiante;
    }
    return Number(idEstudianteUrl);
  }

  private resolverIdEstudiantePropio(req: any): number {
    if (!req.user.idEstudiante) {
      throw new ForbiddenException('El usuario no tiene un estudiante asociado.');
    }
    return req.user.idEstudiante;
  }

  @Get('estudiantes/:idEstudiante/cv/datos-academicos')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findDatosAcademicos(@Param('idEstudiante') idEstudiante: string, @Req() req: any) {
    return this.cvService.findDatosAcademicos(this.resolverIdEstudianteLectura(req, idEstudiante));
  }

  @Post('estudiantes/:idEstudiante/cv/datos-academicos')
  @Roles('ESTUDIANTE')
  createDatoAcademico(@Body() dto: CreateCvDatoAcademicoDto, @Req() req: any) {
    return this.cvService.createDatoAcademico(this.resolverIdEstudiantePropio(req), dto);
  }

  @Patch('cv/datos-academicos/:id')
  @Roles('ESTUDIANTE')
  updateDatoAcademico(@Param('id') id: string, @Body() dto: UpdateCvDatoAcademicoDto, @Req() req: any) {
    return this.cvService.updateDatoAcademico(Number(id), dto, this.resolverIdEstudiantePropio(req));
  }

  @Delete('cv/datos-academicos/:id')
  @Roles('ESTUDIANTE')
  removeDatoAcademico(@Param('id') id: string, @Req() req: any) {
    return this.cvService
      .removeDatoAcademico(Number(id), this.resolverIdEstudiantePropio(req))
      .then(() => ({ deleted: true, id: Number(id) }));
  }

  @Get('estudiantes/:idEstudiante/cv/experiencia-laboral')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findExperienciasLaborales(@Param('idEstudiante') idEstudiante: string, @Req() req: any) {
    return this.cvService.findExperienciasLaborales(this.resolverIdEstudianteLectura(req, idEstudiante));
  }

  @Post('estudiantes/:idEstudiante/cv/experiencia-laboral')
  @Roles('ESTUDIANTE')
  createExperienciaLaboral(@Body() dto: CreateCvExperienciaLaboralDto, @Req() req: any) {
    return this.cvService.createExperienciaLaboral(this.resolverIdEstudiantePropio(req), dto);
  }

  @Patch('cv/experiencia-laboral/:id')
  @Roles('ESTUDIANTE')
  updateExperienciaLaboral(@Param('id') id: string, @Body() dto: UpdateCvExperienciaLaboralDto, @Req() req: any) {
    return this.cvService.updateExperienciaLaboral(Number(id), dto, this.resolverIdEstudiantePropio(req));
  }

  @Delete('cv/experiencia-laboral/:id')
  @Roles('ESTUDIANTE')
  removeExperienciaLaboral(@Param('id') id: string, @Req() req: any) {
    return this.cvService
      .removeExperienciaLaboral(Number(id), this.resolverIdEstudiantePropio(req))
      .then(() => ({ deleted: true, id: Number(id) }));
  }

  @Get('estudiantes/:idEstudiante/cv/practicas-duales')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findPracticasDuales(@Param('idEstudiante') idEstudiante: string, @Req() req: any) {
    return this.cvService.findPracticasDuales(this.resolverIdEstudianteLectura(req, idEstudiante));
  }

  @Post('estudiantes/:idEstudiante/cv/practicas-duales')
  @Roles('ESTUDIANTE')
  createPracticaDual(@Body() dto: CreateCvPracticaDualDto, @Req() req: any) {
    return this.cvService.createPracticaDual(this.resolverIdEstudiantePropio(req), dto);
  }

  @Patch('cv/practicas-duales/:id')
  @Roles('ESTUDIANTE')
  updatePracticaDual(@Param('id') id: string, @Body() dto: UpdateCvPracticaDualDto, @Req() req: any) {
    return this.cvService.updatePracticaDual(Number(id), dto, this.resolverIdEstudiantePropio(req));
  }

  @Delete('cv/practicas-duales/:id')
  @Roles('ESTUDIANTE')
  removePracticaDual(@Param('id') id: string, @Req() req: any) {
    return this.cvService
      .removePracticaDual(Number(id), this.resolverIdEstudiantePropio(req))
      .then(() => ({ deleted: true, id: Number(id) }));
  }
}
