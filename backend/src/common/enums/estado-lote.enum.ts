// Sección 3.2 del documento de diseño: un lote de animales vivos entra
// en cuarentena y solo pasa a Disponible por una acción manual de un
// humano confirmando que están sanos — nunca automático por fecha.
export enum EstadoLote {
  CUARENTENA = 'cuarentena',
  DISPONIBLE = 'disponible',
  AGOTADO = 'agotado',
}
