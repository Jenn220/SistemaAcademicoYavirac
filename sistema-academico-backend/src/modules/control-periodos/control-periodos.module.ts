import { Module } from '@nestjs/common';

import { ControlPeriodosController } from './control-periodos.controller';
import { ControlPeriodosService } from './control-periodos.service';

@Module({
  controllers: [ControlPeriodosController],
  providers: [ControlPeriodosService],
  exports: [ControlPeriodosService],
})
export class ControlPeriodosModule {}