// Catálogo fijo de permisos del sistema. No es editable desde la app —
// para agregar un permiso nuevo se agrega acá y se asigna un valor por
// defecto por rol en permisos-por-defecto.ts.
export enum Permiso {
  INVENTARIO_VER = 'inventario.ver',
  INVENTARIO_CREAR = 'inventario.crear',
  INVENTARIO_EDITAR = 'inventario.editar',
  INVENTARIO_ELIMINAR = 'inventario.eliminar',

  CATALOGO_GESTIONAR = 'catalogo.gestionar',
  POS_VENDER = 'pos.vender',
  CLIENTES_GESTIONAR = 'clientes.gestionar',
  INFORMES_VER = 'informes.ver',
  FACTURACION_GESTIONAR = 'facturacion.gestionar',
  CONTABILIDAD_VER = 'contabilidad.ver',

  // Nota: administrar cuentas/permisos de otros usuarios NO es un permiso
  // delegable — es exclusivo del rol Administrador (ver RequireRole en
  // UsuariosController), a propósito, para que nunca se pueda otorgar por
  // error ni por decisión de un administrador. Por eso no hay un
  // "usuarios.gestionar" en esta lista.
}
