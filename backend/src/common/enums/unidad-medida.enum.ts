// Cómo se cuenta/vende un ítem. La mayoría de peces, plantas y equipo se
// maneja por pieza (UNIDAD) — el resto es para mercancía a granel
// (alimento, medicamentos) que se vende por peso o volumen.
export enum UnidadMedida {
  UNIDAD = 'unidad',
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
}
