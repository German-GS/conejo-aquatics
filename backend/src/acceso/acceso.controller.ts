import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { LoginUnificadoDto } from './dto/login-unificado.dto.js';

// Un solo formulario en la tienda en línea sirve tanto para clientes como
// para personal: probamos primero contra clientes y, si no coincide, contra
// el personal. El mensaje de error es el mismo en ambos casos para no
// revelar en qué tabla existe el correo.
@Controller('acceso')
export class AccesoController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientesService: ClientesService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginUnificadoDto) {
    try {
      const data = await this.clientesService.login(dto.email, dto.password);
      return { tipo: 'cliente' as const, ...data };
    } catch {
      // No es una cuenta de cliente válida — probamos como personal.
    }

    try {
      const data = await this.authService.login(dto.email, dto.password);
      return { tipo: 'staff' as const, ...data };
    } catch {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }
  }
}
