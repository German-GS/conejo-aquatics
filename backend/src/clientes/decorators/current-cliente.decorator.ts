import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { ClienteAutenticado } from '../cliente-autenticado.interface.js';

export const CurrentCliente = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClienteAutenticado => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: ClienteAutenticado }>();
    return request.user;
  },
);
