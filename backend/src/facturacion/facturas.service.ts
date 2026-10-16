import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Factura } from './factura.entity.js';
import { FacturaLinea } from './factura-linea.entity.js';
import { Cliente } from '../clientes/cliente.entity.js';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { MovimientoInventario } from '../inventario/movimiento-inventario.entity.js';
import { TipoCliente } from '../common/enums/tipo-cliente.enum.js';
import { TipoMovimiento } from '../common/enums/tipo-movimiento.enum.js';
import { EstadoCobroFactura } from '../common/enums/estado-cobro-factura.enum.js';
import type { CrearFacturaDto } from './dto/crear-factura.dto.js';
import type { ActualizarFacturaDto } from './dto/actualizar-factura.dto.js';

// Campos "seguros" del cliente para mostrar en la factura — nunca el
// passwordHash.
const CLIENTE_SEGURO = { id: true, nombre: true, email: true, tipoCliente: true } as const;

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  listar(): Promise<Factura[]> {
    return this.facturaRepo.find({
      relations: { cliente: true },
      select: { cliente: CLIENTE_SEGURO },
      order: { numeroConsecutivo: 'DESC' },
    });
  }

  async buscar(id: string): Promise<Factura> {
    const factura = await this.facturaRepo.findOne({
      where: { id },
      relations: { cliente: true, lineas: true },
      select: { cliente: CLIENTE_SEGURO },
    });
    if (!factura) throw new NotFoundException('Factura no encontrada.');
    return factura;
  }

  async crear(dto: CrearFacturaDto, creadoPorId: string): Promise<Factura> {
    const facturaId = await this.dataSource.transaction(async (manager) => {
      const clienteRepo = manager.getRepository(Cliente);
      const itemRepo = manager.getRepository(InventarioItem);
      const facturaRepo = manager.getRepository(Factura);
      const lineaRepo = manager.getRepository(FacturaLinea);
      const movimientoRepo = manager.getRepository(MovimientoInventario);

      const cliente = await clienteRepo.findOneBy({ id: dto.clienteId });
      if (!cliente) throw new NotFoundException('Cliente no encontrado.');

      const lineas: FacturaLinea[] = [];
      let total = 0;

      for (const l of dto.lineas) {
        const item = await itemRepo.findOneBy({ id: l.itemId });
        if (!item) throw new NotFoundException('Uno de los productos ya no existe.');
        if (item.stock < l.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente de "${item.nombre}" (disponible: ${item.stock}, pedido: ${l.cantidad}).`,
          );
        }

        const precioUnitario =
          l.precioUnitario ??
          Number(
            cliente.tipoCliente === TipoCliente.MAYORISTA
              ? item.precioMayoreo
              : item.precioDetalle,
          );
        const subtotal = Math.round(precioUnitario * l.cantidad * 100) / 100;
        total += subtotal;

        item.stock -= l.cantidad;
        await itemRepo.save(item);

        // Kardex — misma fuente de verdad que cualquier otra salida de
        // stock. Sin asiento contable automático todavía a propósito
        // (ver nota en tipo-movimiento.enum.ts): eso se conecta cuando
        // se integre Facturación con Contabilidad como paso aparte.
        await movimientoRepo.save(
          movimientoRepo.create({
            item,
            lote: null,
            tipo: TipoMovimiento.VENTA_FACTURA,
            cantidad: -l.cantidad,
            costoUnitario: item.costoUnitario,
            creadoPor: { id: creadoPorId } as MovimientoInventario['creadoPor'],
          }),
        );

        lineas.push(
          lineaRepo.create({
            item,
            descripcion: item.nombre,
            cantidad: l.cantidad,
            precioUnitario: precioUnitario.toString(),
            subtotal: subtotal.toString(),
          }),
        );
      }

      const factura = facturaRepo.create({
        cliente,
        fechaEmision: new Date(),
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
        lineas,
        total: total.toString(),
        estadoCobro: EstadoCobroFactura.POR_COBRAR,
        creadoPor: { id: creadoPorId } as Factura['creadoPor'],
      });
      const guardada = await facturaRepo.save(factura);
      return guardada.id;
    });

    return this.buscar(facturaId);
  }

  async actualizar(id: string, dto: ActualizarFacturaDto): Promise<Factura> {
    const factura = await this.facturaRepo.findOneBy({ id });
    if (!factura) throw new NotFoundException('Factura no encontrada.');

    factura.estadoCobro = dto.estadoCobro;
    await this.facturaRepo.save(factura);
    return this.buscar(id);
  }
}
