import { Controller, Get, Query } from '@nestjs/common';
import { PublicoService } from './publico.service.js';

// Sin JwtAuthGuard a propósito: esto lo consume el sitio público
// (Sistema Conejo Aquatics/web), que no tiene sesión de usuario.
@Controller('publico')
export class PublicoController {
  constructor(private readonly publicoService: PublicoService) {}

  @Get('categorias')
  categorias() {
    return this.publicoService.categorias();
  }

  @Get('productos')
  productos(@Query('categoriaId') categoriaId?: string) {
    return this.publicoService.productos(categoriaId);
  }

  @Get('destacados')
  destacados() {
    return this.publicoService.destacados();
  }

  @Get('sitio-config')
  sitioConfig() {
    return this.publicoService.sitioConfig();
  }
}
