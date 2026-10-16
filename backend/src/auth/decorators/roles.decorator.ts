import { SetMetadata } from '@nestjs/common';
import type { Rol } from '../../common/enums/rol.enum.js';

export const ROLES_KEY = 'roles_requeridos';

// Uso: @RequireRole(Rol.ADMINISTRADOR)
// A diferencia de @RequirePermissions, esto NO se puede delegar: es una
// verificación del rol real de la cuenta, no de sus permisos otorgados.
// Se usa para acciones que el negocio pidió que sean exclusivas del
// administrador sin excepción (borrar usuarios, tocar permisos de otros).
export const RequireRole = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
