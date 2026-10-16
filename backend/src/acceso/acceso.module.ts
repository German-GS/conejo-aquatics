import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { AccesoController } from './acceso.controller.js';

@Module({
  imports: [AuthModule, ClientesModule],
  controllers: [AccesoController],
})
export class AccesoModule {}
