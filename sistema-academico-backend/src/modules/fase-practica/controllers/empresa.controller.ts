import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { EmpresaService } from '../services/empresa.service';

@Controller('fase-practica')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post('empresas')
  createEmpresa(@Body() dto: CreateEmpresaDto) {
    return this.empresaService.createEmpresa(dto);
  }

  @Get('empresas')
  findAllEmpresas(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.empresaService.findAllEmpresas(skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Get('empresas/:id')
  findEmpresaById(@Param('id') id: string) {
    return this.empresaService.findEmpresaById(Number(id));
  }

  @Patch('empresas/:id')
  updateEmpresa(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.empresaService.updateEmpresa(Number(id), dto);
  }

  @Delete('empresas/:id')
  removeEmpresa(@Param('id') id: string) {
    return this.empresaService.removeEmpresa(Number(id)).then(() => ({
      deleted: true,
      id_empresa: Number(id),
    }));
  }
}

