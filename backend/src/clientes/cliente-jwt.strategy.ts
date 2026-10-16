import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientesService } from './clientes.service.js';
import type { ClienteJwtPayload } from './cliente-jwt-payload.interface.js';
import type { ClienteAutenticado } from './cliente-autenticado.interface.js';

// Estrategia separada de la del personal ('jwt' en auth/jwt.strategy.ts)
// — nombre distinto ('cliente-jwt') para que un guard de admin nunca
// pueda aceptar por accidente un token de cliente, y viceversa.
@Injectable()
export class ClienteJwtStrategy extends PassportStrategy(Strategy, 'cliente-jwt') {
  constructor(
    config: ConfigService,
    private readonly clientesService: ClientesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: ClienteJwtPayload): Promise<ClienteAutenticado> {
    if (payload.tipo !== 'cliente') {
      throw new UnauthorizedException('Token inválido para esta sesión.');
    }

    const cliente = await this.clientesService.buscarPorId(payload.sub);
    if (!cliente || !cliente.activo) {
      throw new UnauthorizedException('La cuenta ya no está activa.');
    }

    return {
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      tipoCliente: cliente.tipoCliente,
    };
  }
}
