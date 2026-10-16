import { Rol } from '../enums/rol.enum.js';
import { Permiso } from '../enums/permiso.enum.js';

// Permisos que trae cada rol de fábrica. El Administrador no está listado
// a propósito: siempre tiene todos los permisos (ver permisos.util.ts),
// así nunca puede quedar sin acceso por un error de datos.
//
// Bodeguero y Vendedor parten de este set, pero un Administrador puede
// otorgar o revocar permisos puntuales a un usuario específico (tabla
// UsuarioPermiso) sin tener que cambiarle el rol — así dos bodegueros
// pueden terminar con permisos distintos si el negocio lo necesita.
export const PERMISOS_POR_DEFECTO: Record<
  Exclude<Rol, Rol.ADMINISTRADOR>,
  Permiso[]
> = {
  [Rol.BODEGUERO]: [
    Permiso.INVENTARIO_VER,
    Permiso.INVENTARIO_CREAR,
    Permiso.INVENTARIO_EDITAR,
    // INVENTARIO_ELIMINAR NO viene por defecto: requiere autorización
    // explícita del administrador (ver UsuarioPermiso).
  ],
  [Rol.VENDEDOR]: [
    Permiso.CLIENTES_GESTIONAR,
    Permiso.FACTURACION_GESTIONAR,
    // Ni INVENTARIO_VER ni POS_VENDER vienen por defecto: un vendedor
    // trabaja desde Facturación, no maneja el inventario crudo ni el
    // punto de venta. Si un vendedor puntual también hace de bodeguero
    // o cubre caja, se le agregan esos permisos individualmente desde
    // Personal → Permisos, sin tener que cambiarle el rol.
  ],
};
