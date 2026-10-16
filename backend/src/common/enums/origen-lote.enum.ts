// Clasifica cada lote para efectos contables (sección de Contabilidad):
//
// - COMPRA: se compra el ejemplar ya grande/listo para vender. No hay
//   transformación biológica bajo nuestro control → NIC 2, inventario
//   ordinario.
// - COMPRA_ENGORDE: se compra pequeño/joven y se engorda o cría acá
//   antes de venderlo. SÍ hay transformación biológica bajo nuestro
//   control (crece acá), aunque el origen del ejemplar sea una compra
//   → NIIF 41, activo biológico. El costo de compra se sigue asentando
//   contra cuentas por pagar, igual que COMPRA — la diferencia es la
//   cuenta de activo donde cae (biológico, no inventario de reventa).
// - PRODUCCION_PROPIA: nace o se reproduce acá (ej. neocaridinas,
//   microfauna). Transformación biológica plena bajo nuestro control,
//   sin costo de compra → NIIF 41, reconocido a valor razonable con la
//   ganancia yendo a resultados (no hay proveedor que pagar).
export enum OrigenLote {
  COMPRA = 'compra',
  COMPRA_ENGORDE = 'compra_engorde',
  PRODUCCION_PROPIA = 'produccion_propia',
}
