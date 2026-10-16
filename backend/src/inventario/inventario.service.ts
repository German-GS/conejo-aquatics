import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { InventarioItem } from './inventario-item.entity.js';
import { Lote } from './lote.entity.js';
import { MovimientoInventario } from './movimiento-inventario.entity.js';
import { Categoria } from '../catalogo/categoria.entity.js';
import { TipoItem } from '../common/enums/tipo-item.enum.js';
import { EstadoLote } from '../common/enums/estado-lote.enum.js';
import { UnidadMedida } from '../common/enums/unidad-medida.enum.js';
import { TipoMovimiento } from '../common/enums/tipo-movimiento.enum.js';
import { ContabilidadService } from '../contabilidad/contabilidad.service.js';
import type { CrearItemDto } from './dto/crear-item.dto.js';
import type { ActualizarItemDto } from './dto/actualizar-item.dto.js';
import type { IngresarLoteDto } from './dto/ingresar-lote.dto.js';
import type { IngresarStockDto } from './dto/ingresar-stock.dto.js';
import { MotivoAjuste, type AjustarStockDto } from './dto/ajustar-stock.dto.js';
import type { RegistrarMortalidadDto } from './dto/registrar-mortalidad.dto.js';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(InventarioItem)
    private readonly itemRepo: Repository<InventarioItem>,
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepo: Repository<MovimientoInventario>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    private readonly contabilidadService: ContabilidadService,
  ) {}

  listar(): Promise<InventarioItem[]> {
    return this.itemRepo.find({
      relations: { categoria: true },
      order: { creadoEn: 'DESC' },
    });
  }

  // Para la página Catálogo del panel (bodeguero, vendedor, cualquiera
  // logueado) — a diferencia de listar(), NO expone costoUnitario ni
  // creadoPor: eso es información de inventario, no de catálogo, y
  // requiere inventario.ver aparte.
  listarCatalogo(): Promise<InventarioItem[]> {
    return this.itemRepo.find({
      relations: { categoria: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        tipo: true,
        unidadMedida: true,
        precioDetalle: true,
        precioMayoreo: true,
        stock: true,
        imagenUrl: true,
        destacado: true,
        categoria: { id: true, nombre: true, slug: true },
      },
      order: { nombre: 'ASC' },
    });
  }

  async buscar(id: string): Promise<InventarioItem> {
    // findOne CON relations, no findOneBy: comprobado que findOne SIN
    // relations pierde columnas en esta versión de TypeORM, pero con
    // relations (aunque sea una sola) funciona bien — así que de paso
    // trae la categoría.
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: { categoria: true },
    });
    if (!item) throw new NotFoundException('Ítem de inventario no encontrado.');
    return item;
  }

  async crear(dto: CrearItemDto, creadoPorId: string): Promise<InventarioItem> {
    if (dto.codigo) await this.verificarCodigoDisponible(dto.codigo);

    const categoria = dto.categoriaId
      ? await this.buscarCategoria(dto.categoriaId)
      : null;

    const item = this.itemRepo.create({
      nombre: dto.nombre,
      codigo: dto.codigo ?? null,
      tipo: dto.tipo,
      descripcion: dto.descripcion ?? null,
      unidadMedida: dto.unidadMedida ?? UnidadMedida.UNIDAD,
      precioDetalle: dto.precioDetalle.toString(),
      precioMayoreo: dto.precioMayoreo.toString(),
      costoUnitario: dto.costoUnitario?.toString() ?? null,
      stock: 0,
      categoria,
      destacado: dto.destacado ?? false,
      creadoPor: { id: creadoPorId } as InventarioItem['creadoPor'],
    });
    return this.itemRepo.save(item);
  }

  async actualizar(
    id: string,
    dto: ActualizarItemDto,
  ): Promise<InventarioItem> {
    const item = await this.buscar(id);

    if (dto.codigo) await this.verificarCodigoDisponible(dto.codigo, id);

    // No usar Object.assign(item, dto) ni {...dto}: en un PATCH parcial,
    // class-transformer deja como `undefined` (propiedad propia) cada
    // campo no enviado, y eso pisaría con `undefined` los valores reales
    // del ítem que no se estaban tocando.
    if (dto.nombre !== undefined) item.nombre = dto.nombre;
    if (dto.codigo !== undefined) item.codigo = dto.codigo;
    if (dto.tipo !== undefined) item.tipo = dto.tipo;
    if (dto.descripcion !== undefined) item.descripcion = dto.descripcion;
    if (dto.unidadMedida !== undefined) item.unidadMedida = dto.unidadMedida;
    if (dto.precioDetalle !== undefined) {
      item.precioDetalle = dto.precioDetalle.toString();
    }
    if (dto.precioMayoreo !== undefined) {
      item.precioMayoreo = dto.precioMayoreo.toString();
    }
    if (dto.costoUnitario !== undefined) {
      item.costoUnitario = dto.costoUnitario.toString();
    }
    if (dto.destacado !== undefined) item.destacado = dto.destacado;
    if (dto.categoriaId !== undefined) {
      item.categoria = dto.categoriaId
        ? await this.buscarCategoria(dto.categoriaId)
        : null;
    }

    return this.itemRepo.save(item);
  }

  async eliminar(id: string): Promise<void> {
    const item = await this.buscar(id);
    await this.itemRepo.remove(item);
  }

  async guardarImagen(id: string, rutaPublica: string): Promise<InventarioItem> {
    const item = await this.buscar(id);
    item.imagenUrl = rutaPublica;
    return this.itemRepo.save(item);
  }

  private async buscarCategoria(categoriaId: string): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findOneBy({ id: categoriaId });
    if (!categoria) throw new NotFoundException('Categoría no encontrada.');
    return categoria;
  }

  private async verificarCodigoDisponible(
    codigo: string,
    excluirId?: string,
  ): Promise<void> {
    const existente = await this.itemRepo.findOneBy({ codigo });
    if (existente && existente.id !== excluirId) {
      throw new ConflictException(
        `Ya existe un ítem con el código "${codigo}".`,
      );
    }
  }

  // ---- Lotes de animales vivos (sección 3.2 del diseño) ----

  async listarLotes(itemId: string): Promise<Lote[]> {
    const item = await this.buscar(itemId);
    return this.loteRepo.find({
      where: { item: { id: item.id } },
      order: { creadoEn: 'DESC' },
    });
  }

  // Agregado entre todos los ítems — para el dashboard. A diferencia de
  // listarLotes(), no es por ítem: trae todos los lotes en cuarentena
  // del inventario, ordenados por los más viejos primero (los que antes
  // necesitan que alguien los revise).
  lotesEnCuarentena(): Promise<Lote[]> {
    return this.loteRepo.find({
      where: { estado: EstadoLote.CUARENTENA },
      relations: { item: true },
      select: {
        id: true,
        numeroLote: true,
        fechaIngreso: true,
        diasCuarentenaRecomendados: true,
        item: { id: true, nombre: true },
      },
      order: { fechaIngreso: 'ASC' },
    });
  }

  async ingresarLote(
    itemId: string,
    dto: IngresarLoteDto,
    creadoPorId: string,
  ): Promise<Lote> {
    const item = await this.buscar(itemId);
    if (item.tipo !== TipoItem.ANIMAL_VIVO) {
      throw new BadRequestException(
        'Solo los ítems de tipo "animal vivo" reciben lotes — la mercancía general se ingresa con /inventario/:id/ingreso.',
      );
    }

    const lote = this.loteRepo.create({
      item,
      numeroLote: await this.generarNumeroLote(),
      origen: dto.origen,
      valorUnitario: dto.costoUnitario.toString(),
      proveedor: dto.proveedor ?? null,
      fechaIngreso: new Date(),
      cantidadIngresada: dto.cantidadIngresada,
      cantidadDisponible: dto.cantidadIngresada,
      estado: EstadoLote.CUARENTENA,
      diasCuarentenaRecomendados: dto.diasCuarentenaRecomendados ?? null,
    });
    const loteGuardado = await this.loteRepo.save(lote);

    await this.registrarMovimiento({
      item,
      lote: loteGuardado,
      tipo: TipoMovimiento.INGRESO_LOTE,
      cantidad: dto.cantidadIngresada,
      costoUnitario: dto.costoUnitario,
      creadoPorId,
    });

    item.stock += dto.cantidadIngresada;
    // Costo/valor de referencia más reciente del ítem — se usa para
    // valorar mortalidad y ajustes futuros que no traen su propio costo.
    item.costoUnitario = dto.costoUnitario.toString();
    await this.itemRepo.save(item);

    return loteGuardado;
  }

  async pasarLoteADisponible(loteId: string): Promise<Lote> {
    const lote = await this.buscarLote(loteId);
    if (lote.estado !== EstadoLote.CUARENTENA) {
      throw new BadRequestException(
        `Este lote ya está en estado "${lote.estado}", no en cuarentena.`,
      );
    }
    lote.estado = EstadoLote.DISPONIBLE;
    return this.loteRepo.save(lote);
  }

  async registrarMortalidad(
    loteId: string,
    dto: RegistrarMortalidadDto,
    creadoPorId: string,
  ): Promise<Lote> {
    const lote = await this.buscarLote(loteId);
    if (dto.cantidad > lote.cantidadDisponible) {
      throw new BadRequestException(
        `No puede registrar ${dto.cantidad} de mortalidad: el lote solo tiene ${lote.cantidadDisponible} disponibles.`,
      );
    }

    lote.cantidadDisponible -= dto.cantidad;
    if (lote.cantidadDisponible === 0) lote.estado = EstadoLote.AGOTADO;
    const loteGuardado = await this.loteRepo.save(lote);

    await this.registrarMovimiento({
      item: lote.item,
      lote: loteGuardado,
      tipo: TipoMovimiento.MORTALIDAD,
      cantidad: -dto.cantidad,
      // El costo del lote específico, no el del ítem en general — otro
      // lote del mismo ítem puede tener un costo distinto.
      costoUnitario:
        loteGuardado.valorUnitario != null
          ? Number(loteGuardado.valorUnitario)
          : undefined,
      creadoPorId,
    });

    const item = await this.buscar(lote.item.id);
    item.stock = Math.max(0, item.stock - dto.cantidad);
    await this.itemRepo.save(item);

    return loteGuardado;
  }

  private async buscarLote(loteId: string): Promise<Lote> {
    const lote = await this.loteRepo.findOne({
      where: { id: loteId },
      relations: { item: true },
    });
    if (!lote) throw new NotFoundException('Lote no encontrado.');
    return lote;
  }

  // ---- Mercancía general: ingreso y ajustes simples (sin lote) ----

  async ingresarStock(
    itemId: string,
    dto: IngresarStockDto,
    creadoPorId: string,
  ): Promise<InventarioItem> {
    const item = await this.buscar(itemId);
    if (item.tipo !== TipoItem.PRODUCTO_GENERAL) {
      throw new BadRequestException(
        'Los ítems de tipo "animal vivo" ingresan por lote — usá /inventario/:id/lotes.',
      );
    }

    await this.registrarMovimiento({
      item,
      lote: null,
      tipo: TipoMovimiento.INGRESO_STOCK,
      cantidad: dto.cantidad,
      costoUnitario: dto.costoUnitario,
      creadoPorId,
    });

    item.stock += dto.cantidad;
    item.costoUnitario = dto.costoUnitario.toString();
    return this.itemRepo.save(item);
  }

  async ajustarStock(
    itemId: string,
    dto: AjustarStockDto,
    creadoPorId: string,
  ): Promise<InventarioItem> {
    const item = await this.buscar(itemId);
    const nuevoStock = item.stock + dto.cantidad;
    if (nuevoStock < 0) {
      throw new BadRequestException(
        `Ese ajuste dejaría el stock en negativo (actual: ${item.stock}).`,
      );
    }

    await this.registrarMovimiento({
      item,
      lote: null,
      tipo:
        dto.motivo === MotivoAjuste.MERMA
          ? TipoMovimiento.AJUSTE_MERMA
          : TipoMovimiento.AJUSTE_CONTEO,
      cantidad: dto.cantidad,
      creadoPorId,
    });

    item.stock = nuevoStock;
    return this.itemRepo.save(item);
  }

  // ---- Kardex ----

  async listarMovimientos(itemId: string): Promise<MovimientoInventario[]> {
    const item = await this.buscar(itemId);
    return this.movimientoRepo.find({
      where: { item: { id: item.id } },
      relations: { lote: true, creadoPor: true },
      // Sin esto, `creadoPor` trae el Usuario completo, passwordHash
      // incluido, directo en la respuesta del API.
      select: {
        creadoPor: { id: true, nombre: true, email: true, rol: true },
      },
      order: { creadoEn: 'DESC' },
    });
  }

  private async registrarMovimiento(datos: {
    item: InventarioItem;
    lote: Lote | null;
    tipo: TipoMovimiento;
    cantidad: number;
    costoUnitario?: number;
    creadoPorId: string;
  }): Promise<MovimientoInventario> {
    const movimiento = this.movimientoRepo.create({
      item: datos.item,
      lote: datos.lote,
      tipo: datos.tipo,
      cantidad: datos.cantidad,
      costoUnitario: datos.costoUnitario?.toString() ?? null,
      creadoPor: { id: datos.creadoPorId } as MovimientoInventario['creadoPor'],
    });
    const guardado = await this.movimientoRepo.save(movimiento);

    // El valor con el que se asienta: el que trae este movimiento puntual
    // (ingresos) o, si no trae uno, el último costo/valor conocido del
    // ítem (mortalidad, ajustes) — nunca bloquea la operación si no hay
    // ninguno de los dos.
    const valorUnitario =
      datos.costoUnitario ??
      (datos.item.costoUnitario != null ? Number(datos.item.costoUnitario) : null);

    await this.contabilidadService.registrarMovimientoInventario({
      itemId: datos.item.id,
      tipoItem: datos.item.tipo,
      tipoMovimiento: datos.tipo,
      cantidad: datos.cantidad,
      valorUnitario,
      origenLote: datos.lote?.origen ?? null,
      descripcion: `${datos.tipo} — ${datos.item.nombre}`,
      movimientoInventarioId: guardado.id,
    });

    return guardado;
  }

  private async generarNumeroLote(): Promise<string> {
    const year = new Date().getFullYear();
    const inicioAno = new Date(`${year}-01-01T00:00:00.000Z`);
    const finAno = new Date(`${year}-12-31T23:59:59.999Z`);
    const cantidadEsteAno = await this.loteRepo.count({
      where: { creadoEn: Between(inicioAno, finAno) },
    });
    const secuencia = String(cantidadEsteAno + 1).padStart(3, '0');
    return `L-${year}-${secuencia}`;
  }
}
