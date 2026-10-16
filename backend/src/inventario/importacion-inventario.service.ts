import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import ExcelJS from 'exceljs';
import { InventarioItem } from './inventario-item.entity.js';
import { Categoria } from '../catalogo/categoria.entity.js';
import { TipoItem } from '../common/enums/tipo-item.enum.js';
import { UnidadMedida } from '../common/enums/unidad-medida.enum.js';
import { slugify } from '../common/utils/slugify.js';
import type { FilaImportacionDto } from './dto/importar-inventario.dto.js';

// Todo lo importado desde Excel entra bajo esta sección — cada valor
// distinto de la columna "Categoría" del archivo se crea como subsección
// suya (find-or-create, así una segunda importación no duplica
// secciones). Ver decisión con el dueño del negocio: mantiene el navbar
// principal del sitio limpio de nombres de marca sueltos.
const SECCION_RAIZ_IMPORTACION = 'Mercancías generales';

// Nombres de columna esperados en el Excel — normalizados (sin acentos,
// minúscula) para no depender del orden exacto de las columnas.
const COLUMNAS = {
  categoria: (t: string) => t.includes('categor'),
  marca: (t: string) => t === 'marca',
  codigo: (t: string) => t.includes('codigo'),
  modelo: (t: string) => t === 'modelo',
  descripcion: (t: string) => t.includes('descripcion'),
  costo: (t: string) => t.includes('costo'),
  // "P. Venta" en este archivo es el precio al que le vendían a otros
  // acuarios (mayoreo), no el precio público — ver aclaración del dueño.
  ventaMayoreo: (t: string) => t.includes('venta'),
};

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function celdaTexto(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'object') {
    if ('richText' in valor) {
      return valor.richText.map((r) => r.text).join('');
    }
    if ('result' in valor) return String(valor.result ?? '');
    if ('text' in valor) return String((valor as { text: unknown }).text ?? '');
  }
  return String(valor).trim();
}

function celdaNumero(valor: ExcelJS.CellValue): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'object' && 'result' in valor) {
    const resultado = (valor as { result: unknown }).result;
    return typeof resultado === 'number' ? resultado : null;
  }
  const parseado = Number(String(valor).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parseado) ? parseado : null;
}

export type FilaPrevisualizada = {
  fila: number;
  categoriaExcel: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  costoUnitario: number | null;
  precioMayoreo: number;
  conflicto: boolean;
};

export type PrevisualizacionImportacion = {
  filas: FilaPrevisualizada[];
  categorias: { nombre: string; cantidad: number }[];
  totalFilas: number;
  totalConflictos: number;
};

export type ResumenImportacion = {
  creados: number;
  categoriasCreadas: string[];
  omitidos: { codigo: string; motivo: string }[];
};

@Injectable()
export class ImportacionInventarioService {
  constructor(
    @InjectRepository(InventarioItem)
    private readonly itemRepo: Repository<InventarioItem>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async previsualizar(buffer: Buffer): Promise<PrevisualizacionImportacion> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    } catch {
      throw new BadRequestException('El archivo no es un Excel (.xlsx) válido.');
    }

    const hoja = workbook.worksheets[0];
    if (!hoja) throw new BadRequestException('El Excel no tiene ninguna hoja con datos.');

    const encabezados = new Map<string, number>();
    hoja.getRow(1).eachCell((celda, columna) => {
      encabezados.set(normalizar(celdaTexto(celda.value)), columna);
    });

    const columna = (coincide: (t: string) => boolean): number | undefined => {
      for (const [texto, indice] of encabezados) {
        if (coincide(texto)) return indice;
      }
      return undefined;
    };

    const colCategoria = columna(COLUMNAS.categoria);
    const colMarca = columna(COLUMNAS.marca);
    const colCodigo = columna(COLUMNAS.codigo);
    const colModelo = columna(COLUMNAS.modelo);
    const colDescripcion = columna(COLUMNAS.descripcion);
    const colCosto = columna(COLUMNAS.costo);
    const colVenta = columna(COLUMNAS.ventaMayoreo);

    if (!colCategoria || !colCodigo || !colVenta) {
      throw new BadRequestException(
        'No se encontraron las columnas esperadas (Categoría, Código, P. Venta). Revisá los encabezados del Excel.',
      );
    }

    const codigosExistentes = new Set(
      (await this.itemRepo.find({ select: { codigo: true } }))
        .map((i) => i.codigo)
        .filter((c): c is string => !!c),
    );

    const filas: FilaPrevisualizada[] = [];
    const codigosVistos = new Set<string>();

    hoja.eachRow((fila, numeroFila) => {
      if (numeroFila === 1) return;

      const codigo = celdaTexto(fila.getCell(colCodigo).value);
      if (!codigo) return; // fila vacía o sin código, se ignora

      const categoriaExcel = celdaTexto(fila.getCell(colCategoria).value) || 'Sin categoría';
      const marca = colMarca ? celdaTexto(fila.getCell(colMarca).value) : '';
      const modelo = colModelo ? celdaTexto(fila.getCell(colModelo).value) : '';
      const nombre = [marca, modelo].filter(Boolean).join(' ').trim() || codigo;
      const descripcion = colDescripcion ? celdaTexto(fila.getCell(colDescripcion).value) : '';
      const costoUnitario = colCosto ? celdaNumero(fila.getCell(colCosto).value) : null;
      const precioMayoreo = celdaNumero(fila.getCell(colVenta).value) ?? 0;

      const conflicto = codigosExistentes.has(codigo) || codigosVistos.has(codigo);
      codigosVistos.add(codigo);

      filas.push({
        fila: numeroFila,
        categoriaExcel,
        nombre,
        codigo,
        descripcion: descripcion || null,
        costoUnitario,
        precioMayoreo,
        conflicto,
      });
    });

    if (filas.length === 0) {
      throw new BadRequestException('No se encontró ninguna fila con datos para importar.');
    }

    const conteoCategoria = new Map<string, number>();
    for (const f of filas) {
      conteoCategoria.set(f.categoriaExcel, (conteoCategoria.get(f.categoriaExcel) ?? 0) + 1);
    }

    return {
      filas,
      categorias: [...conteoCategoria.entries()]
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad),
      totalFilas: filas.length,
      totalConflictos: filas.filter((f) => f.conflicto).length,
    };
  }

  async confirmar(
    filas: FilaImportacionDto[],
    creadoPorId: string,
  ): Promise<ResumenImportacion> {
    return this.dataSource.transaction(async (manager) => {
      const categoriaRepo = manager.getRepository(Categoria);
      const itemRepo = manager.getRepository(InventarioItem);

      let raiz = await categoriaRepo.findOne({
        where: { nombre: SECCION_RAIZ_IMPORTACION, parent: IsNull() },
      });
      const categoriasCreadas: string[] = [];
      if (!raiz) {
        raiz = await categoriaRepo.save(
          categoriaRepo.create({
            nombre: SECCION_RAIZ_IMPORTACION,
            slug: await this.slugUnico(categoriaRepo, SECCION_RAIZ_IMPORTACION),
            parent: null,
          }),
        );
        categoriasCreadas.push(SECCION_RAIZ_IMPORTACION);
      }

      const subseccionesExistentes = await categoriaRepo.find({
        where: { parent: { id: raiz.id } },
      });
      const subseccionPorNombre = new Map(
        subseccionesExistentes.map((c) => [c.nombre, c] as const),
      );

      const omitidos: { codigo: string; motivo: string }[] = [];
      const codigosVistos = new Set<string>();
      const itemsACrear: InventarioItem[] = [];

      for (const f of filas) {
        if (codigosVistos.has(f.codigo)) {
          omitidos.push({ codigo: f.codigo, motivo: 'Código repetido dentro del archivo.' });
          continue;
        }
        codigosVistos.add(f.codigo);

        const yaExiste = await itemRepo.exists({ where: { codigo: f.codigo } });
        if (yaExiste) {
          omitidos.push({ codigo: f.codigo, motivo: 'Ya existe un ítem con ese código.' });
          continue;
        }

        let subseccion = subseccionPorNombre.get(f.categoriaExcel);
        if (!subseccion) {
          subseccion = await categoriaRepo.save(
            categoriaRepo.create({
              nombre: f.categoriaExcel,
              slug: await this.slugUnico(categoriaRepo, f.categoriaExcel),
              parent: raiz,
            }),
          );
          subseccionPorNombre.set(f.categoriaExcel, subseccion);
          categoriasCreadas.push(`${SECCION_RAIZ_IMPORTACION} › ${f.categoriaExcel}`);
        }

        itemsACrear.push(
          itemRepo.create({
            nombre: f.nombre,
            codigo: f.codigo,
            tipo: TipoItem.PRODUCTO_GENERAL,
            descripcion: f.descripcion ?? null,
            unidadMedida: UnidadMedida.UNIDAD,
            // Precio público no viene en este archivo — queda en 0 a
            // propósito para que salte a la vista qué falta completar.
            precioDetalle: '0',
            precioMayoreo: f.precioMayoreo.toString(),
            costoUnitario: f.costoUnitario?.toString() ?? null,
            stock: 0,
            categoria: subseccion,
            destacado: false,
            creadoPor: { id: creadoPorId } as InventarioItem['creadoPor'],
          }),
        );
      }

      if (itemsACrear.length > 0) await itemRepo.save(itemsACrear);

      return { creados: itemsACrear.length, categoriasCreadas, omitidos };
    });
  }

  private async slugUnico(
    repo: Repository<Categoria>,
    nombre: string,
  ): Promise<string> {
    const base = slugify(nombre) || 'seccion';
    let slug = base;
    let sufijo = 1;
    while (await repo.findOneBy({ slug })) {
      sufijo += 1;
      slug = `${base}-${sufijo}`;
    }
    return slug;
  }
}
