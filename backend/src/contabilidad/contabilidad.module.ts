import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CuentaContable } from './cuenta-contable.entity.js';
import { AsientoContable } from './asiento-contable.entity.js';
import { LineaAsiento } from './linea-asiento.entity.js';
import { ContabilidadService } from './contabilidad.service.js';
import { ContabilidadController } from './contabilidad.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaContable, AsientoContable, LineaAsiento]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [ContabilidadService],
  controllers: [ContabilidadController],
  exports: [ContabilidadService],
})
export class ContabilidadModule {}
