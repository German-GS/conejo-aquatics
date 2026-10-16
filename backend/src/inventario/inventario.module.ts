import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { InventarioItem } from './inventario-item.entity.js';
import { Lote } from './lote.entity.js';
import { MovimientoInventario } from './movimiento-inventario.entity.js';
import { Categoria } from '../catalogo/categoria.entity.js';
import { ContabilidadModule } from '../contabilidad/contabilidad.module.js';
import { InventarioService } from './inventario.service.js';
import { ImportacionInventarioService } from './importacion-inventario.service.js';
import { InventarioController } from './inventario.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventarioItem, Lote, MovimientoInventario, Categoria]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ContabilidadModule,
  ],
  providers: [InventarioService, ImportacionInventarioService],
  controllers: [InventarioController],
  exports: [InventarioService],
})
export class InventarioModule {}
