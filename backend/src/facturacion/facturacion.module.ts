import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Factura } from './factura.entity.js';
import { FacturaLinea } from './factura-linea.entity.js';
import { Cliente } from '../clientes/cliente.entity.js';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { MovimientoInventario } from '../inventario/movimiento-inventario.entity.js';
import { FacturasService } from './facturas.service.js';
import { FacturasController } from './facturas.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, FacturaLinea, Cliente, InventarioItem, MovimientoInventario]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [FacturasService],
  controllers: [FacturasController],
})
export class FacturacionModule {}
