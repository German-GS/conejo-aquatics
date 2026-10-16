import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { JwtPayload } from './jwt-payload.interface.js';
import type { UsuarioAutenticado } from './usuario-autenticado.interface.js';
import { permisosEfectivos } from '../common/permisos/permisos.util.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    const usuario = await this.usuariosService.buscarPorIdConPermisos(
      payload.sub,
    );
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('La cuenta ya no está activa.');
    }

    const overrides = usuario.permisos.map((p) => ({
      permiso: p.permiso,
      concedido: p.concedido,
    }));

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      permisos: permisosEfectivos(usuario.rol, overrides),
    };
  }
}
