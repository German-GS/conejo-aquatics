// Sección 3.3 del documento de diseño (kardex). Todavía no existen POS
// ni tienda web, así que VentaPOS/VentaWeb/DevolucionVenta quedan acá
// definidos para cuando se construyan esos módulos, pero por ahora nada
// los genera. VentaFactura sí está conectado — ver FacturasService.
export enum TipoMovimiento {
  INGRESO_LOTE = 'ingreso_lote', // alta de un lote de animal vivo (entra en cuarentena)
  INGRESO_STOCK = 'ingreso_stock', // alta simple de mercancía general
  MORTALIDAD = 'mortalidad', // animales que mueren antes de venderse
  AJUSTE_MERMA = 'ajuste_merma', // mercancía general dañada/perdida
  AJUSTE_CONTEO = 'ajuste_conteo', // corrección manual tras un conteo físico
  VENTA_POS = 'venta_pos',
  VENTA_WEB = 'venta_web',
  VENTA_FACTURA = 'venta_factura', // salida generada al crear una factura
  DEVOLUCION_VENTA = 'devolucion_venta',
}
