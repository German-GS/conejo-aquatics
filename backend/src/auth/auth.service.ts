import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { permisosEfectivos } from '../common/permisos/permisos.util.js';
import type { JwtPayload } from './jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.usuariosService.buscarPorEmailConPermisos(
      email,
    );
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    const overrides = usuario.permisos.map((p) => ({
      permiso: p.permiso,
      concedido: p.concedido,
    }));

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        permisos: [...permisosEfectivos(usuario.rol, overrides)],
      },
    };
  }
}
