import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { Rol } from '../../common/enums/rol.enum.js';
import type { UsuarioAutenticado } from '../usuario-autenticado.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requeridos || requeridos.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();
    const usuario = request.user;

    if (!usuario || !requeridos.includes(usuario.rol)) {
      throw new ForbiddenException(
        'Esta acción es exclusiva de administradores.',
      );
    }
    return true;
  }
}
