import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { UsuarioAutenticado } from './usuario-autenticado.interface.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() usuario: UsuarioAutenticado) {
    return { ...usuario, permisos: [...usuario.permisos] };
  }

  // Disponible para cualquier usuario autenticado, sin importar el rol:
  // es lo único que un bodeguero o vendedor puede cambiar de sí mismo.
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async cambiarPassword(
    @Body() dto: CambiarPasswordDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    await this.usuariosService.cambiarPassword(usuario.id, dto);
    return { actualizado: true };
  }
}
