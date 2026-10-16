import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { CrearCategoriaDto } from './dto/crear-categoria.dto.js';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permiso } from '../common/enums/permiso.enum.js';

// Sin @RequirePermissions a nivel de clase a propósito: el árbol de
// categorías también lo necesita cualquier usuario logueado para ver la
// página de Catálogo (bodeguero, vendedor), no solo quien administra el
// sitio. JwtAuthGuard igual exige sesión válida. Crear/editar/eliminar
// categorías sí requiere catalogo.gestionar — eso se declara por método.
@Controller('categorias')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  arbol() {
    return this.categoriasService.arbol();
  }

  @Post()
  @RequirePermissions(Permiso.CATALOGO_GESTIONAR)
  crear(@Body() dto: CrearCategoriaDto) {
    return this.categoriasService.crear(dto);
  }

  @Patch(':id')
  @RequirePermissions(Permiso.CATALOGO_GESTIONAR)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarCategoriaDto) {
    return this.categoriasService.actualizar(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permiso.CATALOGO_GESTIONAR)
  async eliminar(@Param('id') id: string) {
    await this.categoriasService.eliminar(id);
    return { eliminado: true };
  }
}
