import type { Rol } from '../common/enums/rol.enum.js';
import type { Permiso } from '../common/enums/permiso.enum.js';

// Lo que queda disponible en `request.user` tras pasar el JwtAuthGuard.
export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  permisos: Set<Permiso>;
}
