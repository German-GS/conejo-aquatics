export const TIPOS_ITEM = ["animal_vivo", "producto_general"] as const;
export type TipoItem = (typeof TIPOS_ITEM)[number];

export const TIPO_ITEM_LABELS: Record<TipoItem, string> = {
  animal_vivo: "Animal vivo",
  producto_general: "Mercancía general",
};

export const UNIDADES_MEDIDA = ["unidad", "kg", "g", "l", "ml"] as const;
export type UnidadMedida = (typeof UNIDADES_MEDIDA)[number];

export const UNIDAD_MEDIDA_LABELS: Record<UnidadMedida, string> = {
  unidad: "Unidad (pieza)",
  kg: "Kilogramo (kg)",
  g: "Gramo (g)",
  l: "Litro (l)",
  ml: "Mililitro (ml)",
};

export type InventarioItem = {
  id: string;
  nombre: string;
  codigo: string | null;
  tipo: TipoItem;
  descripcion: string | null;
  unidadMedida: UnidadMedida;
  precioDetalle: string;
  precioMayoreo: string;
  costoUnitario: string | null;
  stock: number;
  categoria: { id: string; nombre: string; slug: string } | null;
  destacado: boolean;
  imagenUrl: string | null;
  creadoPor: { id: string } | null;
  creadoEn: string;
  actualizadoEn: string;
};

export const ESTADOS_LOTE = ["cuarentena", "disponible", "agotado"] as const;
export type EstadoLote = (typeof ESTADOS_LOTE)[number];

export const ESTADO_LOTE_LABELS: Record<EstadoLote, string> = {
  cuarentena: "En cuarentena",
  disponible: "Disponible",
  agotado: "Agotado",
};

export const ORIGENES_LOTE = ["compra", "compra_engorde", "produccion_propia"] as const;
export type OrigenLote = (typeof ORIGENES_LOTE)[number];

export const ORIGEN_LOTE_LABELS: Record<OrigenLote, string> = {
  compra: "Comprado, listo para vender",
  compra_engorde: "Comprado chico, se engorda aquí",
  produccion_propia: "Producción propia (nace aquí)",
};

// Para Contabilidad: solo "compra" es inventario ordinario (NIC 2). Los
// otros dos todavía van a transformarse biológicamente bajo nuestro
// control, así que son activo biológico (NIIF 41) igual.
export const ORIGEN_LOTE_ES_ACTIVO_BIOLOGICO: Record<OrigenLote, boolean> = {
  compra: false,
  compra_engorde: true,
  produccion_propia: true,
};

export type Lote = {
  id: string;
  numeroLote: string;
  proveedor: string | null;
  origen: OrigenLote;
  valorUnitario: string | null;
  fechaIngreso: string;
  cantidadIngresada: number;
  cantidadDisponible: number;
  estado: EstadoLote;
  diasCuarentenaRecomendados: number | null;
  creadoEn: string;
};

// Lo que trae GET /inventario/lotes/cuarentena — agregado entre ítems,
// para el dashboard.
export type LoteEnCuarentena = {
  id: string;
  numeroLote: string;
  fechaIngreso: string;
  diasCuarentenaRecomendados: number | null;
  item: { id: string; nombre: string };
};

export const TIPO_MOVIMIENTO_LABELS: Record<string, string> = {
  ingreso_lote: "Ingreso de lote",
  ingreso_stock: "Ingreso de mercancía",
  mortalidad: "Mortalidad",
  ajuste_merma: "Ajuste — merma",
  ajuste_conteo: "Ajuste — conteo",
  venta_pos: "Venta en tienda",
  venta_web: "Venta en línea",
  devolucion_venta: "Devolución",
};

export type MovimientoInventario = {
  id: string;
  tipo: string;
  cantidad: number;
  costoUnitario: string | null;
  lote: { numeroLote: string } | null;
  creadoPor: { nombre: string } | null;
  creadoEn: string;
};
