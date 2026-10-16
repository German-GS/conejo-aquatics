import { NaturalezaCuenta, TipoCuenta } from './cuenta-contable.entity.js';

// Catálogo de cuentas base de Conejo Aquatics — propio de este sistema,
// no compartido con el de Conejo Motors. Se siembra automáticamente al
// arrancar el backend si la tabla está vacía (ver ContabilidadService).
//
// 1310 vs 1320 es la clasificación que pidió el negocio: un ejemplar
// comprado ya listo para vender es inventario ordinario (NIC 2). Uno que
// todavía va a transformarse biológicamente bajo nuestro control —ya sea
// porque se compró chico para engordar acá o porque nació/se reprodujo
// acá (ej. neocaridinas, microfauna)— es un activo biológico bajo NIIF
// 41. Ver origen-lote.enum.ts para la clasificación de cada lote.
export const CATALOGO_CUENTAS_BASE: {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
}[] = [
  {
    codigo: '1300',
    nombre: 'Inventario de mercancía general',
    tipo: TipoCuenta.ACTIVO,
    naturaleza: NaturalezaCuenta.DEUDORA,
  },
  {
    codigo: '1310',
    nombre: 'Inventario de animales para reventa (NIC 2)',
    tipo: TipoCuenta.ACTIVO,
    naturaleza: NaturalezaCuenta.DEUDORA,
  },
  {
    codigo: '1320',
    nombre: 'Activos biológicos en transformación (NIIF 41)',
    tipo: TipoCuenta.ACTIVO,
    naturaleza: NaturalezaCuenta.DEUDORA,
  },
  {
    codigo: '2100',
    nombre: 'Cuentas por pagar proveedores',
    tipo: TipoCuenta.PASIVO,
    naturaleza: NaturalezaCuenta.ACREEDORA,
  },
  {
    codigo: '4100',
    nombre: 'Ganancia por reconocimiento de activos biológicos',
    tipo: TipoCuenta.INGRESO,
    naturaleza: NaturalezaCuenta.ACREEDORA,
  },
  {
    codigo: '4200',
    nombre: 'Sobrantes de inventario (conteo físico)',
    tipo: TipoCuenta.INGRESO,
    naturaleza: NaturalezaCuenta.ACREEDORA,
  },
  {
    codigo: '5100',
    nombre: 'Costo de ventas',
    tipo: TipoCuenta.GASTO,
    naturaleza: NaturalezaCuenta.DEUDORA,
  },
  {
    codigo: '5200',
    nombre: 'Pérdida por mortalidad de animales',
    tipo: TipoCuenta.GASTO,
    naturaleza: NaturalezaCuenta.DEUDORA,
  },
  {
    codigo: '5300',
    nombre: 'Faltantes y merma de inventario',
    tipo: TipoCuenta.GASTO,
    naturaleza: NaturalezaCuenta.DEUDORA,
  },
];
