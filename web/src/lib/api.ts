export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type NodoCategoria = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  hijos: NodoCategoria[];
};

export type ProductoPublico = {
  id: string;
  nombre: string;
  tipo: "animal_vivo" | "producto_general";
  precioDetalle: string;
  precioMayoreo: string;
  stock: number;
  imagenUrl: string | null;
  destacado: boolean;
  categoria: { id: string; nombre: string; slug: string } | null;
};

export type SitioConfig = {
  heroInsignia: string;
  heroTitulo: string;
  heroTituloDestacado: string;
  heroSubtitulo: string;
  heroCta1Label: string;
  heroCta2Label: string;
  bannerMayoreoTitulo: string;
  bannerMayoreoSubtitulo: string;
  bannerMayoreoCtaLabel: string;
  footerDescripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
};

async function obtener<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} pidiendo ${path}`);
  return res.json() as Promise<T>;
}

// Mismos valores por defecto que trae la fila `sitio_config` recién
// creada en el backend — se usan acá solo si la API no responde, para
// que la home nunca se quede sin texto.
export const SITIO_CONFIG_DEFECTO: SitioConfig = {
  heroInsignia: "🐠 Nuevos ingresos cada semana",
  heroTitulo: "Todo para tu acuario,",
  heroTituloDestacado: "directo del experto",
  heroSubtitulo:
    "Peces, plantas, alimento y equipo con trazabilidad por lote y cuarentena verificada. Venta al detalle en tienda y al por mayor para otros negocios, con factura electrónica en cada compra.",
  heroCta1Label: "Ver catálogo",
  heroCta2Label: "Comprar al por mayor",
  bannerMayoreoTitulo: "¿Tenés un pet shop o negocio propio?",
  bannerMayoreoSubtitulo:
    "Creá una cuenta mayorista y accedé a precios especiales en todo el catálogo, con factura electrónica en cada pedido.",
  bannerMayoreoCtaLabel: "Solicitar cuenta mayorista",
  footerDescripcion:
    "Peces, plantas y equipo para tu acuario. Venta al detalle y al por mayor, con trazabilidad y factura electrónica.",
  direccion: "San José, Costa Rica",
  telefono: "+506 0000-0000",
  email: "hola@conejoaquatics.cr",
  instagramUrl: null,
  facebookUrl: null,
};

export const publico = {
  categorias: () => obtener<NodoCategoria[]>("/publico/categorias"),
  productos: (categoriaId?: string) =>
    obtener<ProductoPublico[]>(
      `/publico/productos${categoriaId ? `?categoriaId=${categoriaId}` : ""}`,
    ),
  destacados: () => obtener<ProductoPublico[]>("/publico/destacados"),
  sitioConfig: () => obtener<SitioConfig>("/publico/sitio-config"),
};

export function urlImagen(ruta: string | null): string | null {
  return ruta ? `${API_URL}${ruta}` : null;
}
