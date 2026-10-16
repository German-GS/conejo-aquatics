import { BadRequestException, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaContable, NaturalezaCuenta } from './cuenta-contable.entity.js';
import { AsientoContable } from './asiento-contable.entity.js';
import { LineaAsiento } from './linea-asiento.entity.js';
import { CATALOGO_CUENTAS_BASE } from './catalogo-cuentas.js';
import { TipoItem } from '../common/enums/tipo-item.enum.js';
import { TipoMovimiento } from '../common/enums/tipo-movimiento.enum.js';
import { OrigenLote } from '../common/enums/origen-lote.enum.js';

type LineaAsientoInput = { codigoCuenta: string; debe?: number; haber?: number };

@Injectable()
export class ContabilidadService implements OnModuleInit {
  private readonly logger = new Logger(ContabilidadService.name);

  constructor(
    @InjectRepository(CuentaContable)
    private readonly cuentaRepo: Repository<CuentaContable>,
    @InjectRepository(AsientoContable)
    private readonly asientoRepo: Repository<AsientoContable>,
    @InjectRepository(LineaAsiento)
    private readonly lineaRepo: Repository<LineaAsiento>,
  ) {}

  // Siembra el catálogo de cuentas base la primera vez que arranca el
  // backend contra una base vacía — así el módulo nunca depende de que
  // alguien recuerde correr un script aparte.
  async onModuleInit() {
    const existentes = await this.cuentaRepo.count();
    if (existentes > 0) return;

    await this.cuentaRepo.save(this.cuentaRepo.create(CATALOGO_CUENTAS_BASE));
    this.logger.log(
      `Catálogo de cuentas sembrado (${CATALOGO_CUENTAS_BASE.length} cuentas).`,
    );
  }

  listarCuentas(): Promise<CuentaContable[]> {
    return this.cuentaRepo.find({ order: { codigo: 'ASC' } });
  }

  async listarAsientos(limite = 200): Promise<AsientoContable[]> {
    return this.asientoRepo.find({
      relations: { lineas: true },
      order: { fecha: 'DESC', creadoEn: 'DESC' },
      take: limite,
    });
  }

  // Saldo con signo "natural" de la cuenta: positivo cuando el saldo va
  // en el sentido esperado según su naturaleza (ej. un activo con saldo
  // deudor da positivo).
  async saldosPorCuenta(): Promise<Map<string, number>> {
    const lineas = await this.lineaRepo.find({ relations: { cuenta: true } });
    const saldos = new Map<string, number>();

    for (const linea of lineas) {
      const codigo = linea.cuenta.codigo;
      const debe = Number(linea.debe);
      const haber = Number(linea.haber);
      const delta =
        linea.cuenta.naturaleza === NaturalezaCuenta.DEUDORA
          ? debe - haber
          : haber - debe;
      saldos.set(codigo, (saldos.get(codigo) ?? 0) + delta);
    }

    return saldos;
  }

  async registrarAsiento(datos: {
    fecha?: Date;
    descripcion: string;
    origenTipo?: string;
    origenId?: string;
    lineas: LineaAsientoInput[];
  }): Promise<AsientoContable> {
    const totalDebe = datos.lineas.reduce((s, l) => s + (l.debe ?? 0), 0);
    const totalHaber = datos.lineas.reduce((s, l) => s + (l.haber ?? 0), 0);
    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      throw new BadRequestException(
        `El asiento no cuadra: debe ${totalDebe} ≠ haber ${totalHaber} ("${datos.descripcion}").`,
      );
    }

    const cuentas = await Promise.all(
      datos.lineas.map((l) => this.obtenerCuenta(l.codigoCuenta)),
    );

    const asiento = this.asientoRepo.create({
      fecha: datos.fecha ?? new Date(),
      descripcion: datos.descripcion,
      origenTipo: datos.origenTipo ?? null,
      origenId: datos.origenId ?? null,
      lineas: datos.lineas.map((l, i) =>
        this.lineaRepo.create({
          cuenta: cuentas[i],
          debe: (l.debe ?? 0).toString(),
          haber: (l.haber ?? 0).toString(),
        }),
      ),
    });

    return this.asientoRepo.save(asiento);
  }

  private async obtenerCuenta(codigo: string): Promise<CuentaContable> {
    const cuenta = await this.cuentaRepo.findOneBy({ codigo });
    if (!cuenta) {
      throw new BadRequestException(
        `La cuenta contable ${codigo} no existe en el catálogo.`,
      );
    }
    return cuenta;
  }

  // 1310 (NIC 2) solo para lo que ya está listo para vender tal cual se
  // compró. 1320 (NIIF 41) para todo lo que todavía va a transformarse
  // biológicamente bajo nuestro control — ya sea porque nació acá
  // (producción propia) o porque se compró chico y se engorda acá.
  private cuentaInventarioPara(
    tipoItem: TipoItem,
    origenLote: OrigenLote | null,
  ): string {
    if (tipoItem === TipoItem.PRODUCTO_GENERAL) return '1300';
    return origenLote === OrigenLote.COMPRA ? '1310' : '1320';
  }

  // Punto de entrada único desde Inventario: traduce un movimiento del
  // kardex a su asiento de partida doble, según el tipo de movimiento y
  // la clasificación NIC 2 / NIIF 41 del ítem o lote involucrado.
  //
  // Devuelve null (sin lanzar error) cuando el movimiento no trae un
  // valor de referencia con qué asentarlo — nunca debe bloquear una
  // operación de inventario (ej. registrar mortalidad) solo porque
  // todavía no se conoce el costo de ese ítem.
  async registrarMovimientoInventario(datos: {
    itemId: string;
    tipoItem: TipoItem;
    tipoMovimiento: TipoMovimiento;
    cantidad: number;
    valorUnitario: number | null;
    origenLote: OrigenLote | null;
    descripcion: string;
    movimientoInventarioId: string;
  }): Promise<AsientoContable | null> {
    if (datos.valorUnitario == null || datos.valorUnitario <= 0) return null;

    const monto = Math.round(Math.abs(datos.cantidad) * datos.valorUnitario * 100) / 100;
    if (monto <= 0) return null;

    const cuentaInventario = this.cuentaInventarioPara(
      datos.tipoItem,
      datos.origenLote,
    );
    const base = {
      descripcion: datos.descripcion,
      origenTipo: 'movimiento_inventario',
      origenId: datos.movimientoInventarioId,
    };

    switch (datos.tipoMovimiento) {
      case TipoMovimiento.INGRESO_STOCK:
        return this.registrarAsiento({
          ...base,
          lineas: [
            { codigoCuenta: cuentaInventario, debe: monto },
            { codigoCuenta: '2100', haber: monto },
          ],
        });

      case TipoMovimiento.INGRESO_LOTE:
        if (datos.origenLote === OrigenLote.PRODUCCION_PROPIA) {
          return this.registrarAsiento({
            ...base,
            lineas: [
              { codigoCuenta: cuentaInventario, debe: monto },
              { codigoCuenta: '4100', haber: monto },
            ],
          });
        }
        return this.registrarAsiento({
          ...base,
          lineas: [
            { codigoCuenta: cuentaInventario, debe: monto },
            { codigoCuenta: '2100', haber: monto },
          ],
        });

      case TipoMovimiento.MORTALIDAD:
        return this.registrarAsiento({
          ...base,
          lineas: [
            { codigoCuenta: '5200', debe: monto },
            { codigoCuenta: cuentaInventario, haber: monto },
          ],
        });

      case TipoMovimiento.AJUSTE_MERMA:
        return this.registrarAsiento({
          ...base,
          lineas: [
            { codigoCuenta: '5300', debe: monto },
            { codigoCuenta: cuentaInventario, haber: monto },
          ],
        });

      case TipoMovimiento.AJUSTE_CONTEO:
        return datos.cantidad > 0
          ? this.registrarAsiento({
              ...base,
              lineas: [
                { codigoCuenta: cuentaInventario, debe: monto },
                { codigoCuenta: '4200', haber: monto },
              ],
            })
          : this.registrarAsiento({
              ...base,
              lineas: [
                { codigoCuenta: '5300', debe: monto },
                { codigoCuenta: cuentaInventario, haber: monto },
              ],
            });

      default:
        // VENTA_POS / VENTA_WEB / DEVOLUCION_VENTA: todavía no existen
        // POS ni carrito — se conecta cuando se construyan.
        return null;
    }
  }
}
