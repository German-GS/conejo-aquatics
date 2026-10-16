import { Rol } from '../enums/rol.enum.js';
import { Permiso } from '../enums/permiso.enum.js';
import { PERMISOS_POR_DEFECTO } from './permisos-por-defecto.js';

export type OverridePermiso = { permiso: Permiso; concedido: boolean };

/**
 * Resuelve el set de permisos que realmente tiene un usuario:
 * Administrador -> todos, siempre (no depende de datos en la BD).
 * Bodeguero/Vendedor -> permisos por defecto de su rol, más los
 * overrides puntuales (concedido=true agrega, concedido=false quita).
 */
export function permisosEfectivos(
  rol: Rol,
  overrides: OverridePermiso[] = [],
): Set<Permiso> {
  if (rol === Rol.ADMINISTRADOR) {
    return new Set(Object.values(Permiso));
  }

  const base = new Set(PERMISOS_POR_DEFECTO[rol] ?? []);
  for (const { permiso, concedido } of overrides) {
    if (concedido) base.add(permiso);
    else base.delete(permiso);
  }
  return base;
}

export function tienePermiso(
  rol: Rol,
  overrides: OverridePermiso[],
  permiso: Permiso,
): boolean {
  return permisosEfectivos(rol, overrides).has(permiso);
}
