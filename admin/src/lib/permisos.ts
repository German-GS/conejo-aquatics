// Espejo del enum Permiso del backend (src/common/enums/permiso.enum.ts).
// Se duplica acá a propósito: el admin es un proyecto/repo aparte del
// backend, sin paquete compartido — igual que el resto del sistema.
//
// Nota: no existe un permiso "usuarios.gestionar" acá. Administrar
// cuentas (crear, editar, borrar, tocar permisos de otros) es exclusivo
// del rol Administrador — no es algo que se pueda delegar a un
// bodeguero o vendedor otorgándoles un permiso. Ver RequireRole en el
// backend.
export const PERMISOS = [
  "inventario.ver",
  "inventario.crear",
  "inventario.editar",
  "inventario.eliminar",
  "catalogo.gestionar",
  "pos.vender",
  "clientes.gestionar",
  "informes.ver",
  "facturacion.gestionar",
  "contabilidad.ver",
] as const;

export type Permiso = (typeof PERMISOS)[number];

export const PERMISO_LABELS: Record<Permiso, string> = {
  "inventario.ver": "Ver inventario",
  "inventario.crear": "Agregar al inventario",
  "inventario.editar": "Editar inventario",
  "inventario.eliminar": "Eliminar del inventario",
  "catalogo.gestionar": "Gestionar catálogo",
  "pos.vender": "Vender en el punto de venta",
  "clientes.gestionar": "Gestionar clientes",
  "informes.ver": "Ver informes",
  "facturacion.gestionar": "Gestionar facturación",
  "contabilidad.ver": "Ver contabilidad",
};

export const PERMISO_GRUPOS: { titulo: string; permisos: Permiso[] }[] = [
  {
    titulo: "Inventario",
    permisos: [
      "inventario.ver",
      "inventario.crear",
      "inventario.editar",
      "inventario.eliminar",
    ],
  },
  {
    titulo: "Ventas y clientes",
    permisos: ["pos.vender", "clientes.gestionar", "catalogo.gestionar"],
  },
  {
    titulo: "Administración",
    permisos: ["informes.ver", "facturacion.gestionar", "contabilidad.ver"],
  },
];

export const ROLES = ["administrador", "bodeguero", "vendedor"] as const;
export type RolUsuario = (typeof ROLES)[number];

export const ROL_LABELS: Record<RolUsuario, string> = {
  administrador: "Administrador",
  bodeguero: "Bodeguero",
  vendedor: "Vendedor",
};

// Lo mismo que PERMISOS_POR_DEFECTO del backend, solo para mostrar en la UI
// cuáles vienen "de fábrica" con el rol antes de que el admin ajuste nada.
export const PERMISOS_POR_DEFECTO_ROL: Record<RolUsuario, Permiso[]> = {
  administrador: [...PERMISOS],
  bodeguero: ["inventario.ver", "inventario.crear", "inventario.editar"],
  vendedor: ["clientes.gestionar", "facturacion.gestionar"],
};
