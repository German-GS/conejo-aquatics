// Las dos familias de ítem del diseño (sección 3.1 del documento):
// animal vivo vs. mercancía general. Por ahora el inventario guarda
// cantidad simple; el detalle de lotes/cuarentena de AnimalVariante
// se agrega cuando construyamos esa parte del módulo.
export enum TipoItem {
  ANIMAL_VIVO = 'animal_vivo',
  PRODUCTO_GENERAL = 'producto_general',
}
