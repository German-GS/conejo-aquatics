import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { ActualizarPermisoDto } from './dto/actualizar-permiso.dto.js';
import { ResetearPasswordDto } from './dto/resetear-password.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RequireRole } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Rol } from '../common/enums/rol.enum.js';
import type { UsuarioAutenticado } from '../auth/usuario-autenticado.interface.js';
import type { Usuario } from './usuario.entity.js';

function sinPassword(usuario: Usuario) {
  const { passwordHash: _passwordHash, ...resto } = usuario;
  return resto;
}

// Todo lo de administración de cuentas (crear, editar datos/rol, borrar,
// tocar permisos de otros) es exclusivo del rol Administrador — no es un
// permiso delegable como los del módulo de inventario. Un bodeguero o
// vendedor solo puede cambiar su propia contraseña (ver AuthController,
// PATCH /auth/password), nada más de esta sección.
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRole(Rol.ADMINISTRADOR)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async listar() {
    const usuarios = await this.usuariosService.listar();
    return usuarios.map(sinPassword);
  }

  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
    const usuario = await this.usuariosService.crear(dto);
    return sinPassword(usuario);
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
    @CurrentUser() admin: UsuarioAutenticado,
  ) {
    const usuario = await this.usuariosService.actualizar(id, dto, admin.id);
    return sinPassword(usuario);
  }

  @Delete(':id')
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() admin: UsuarioAutenticado,
  ) {
    await this.usuariosService.eliminar(id, admin.id);
    return { eliminado: true };
  }

  @Patch(':id/password')
  async resetearPassword(
    @Param('id') id: string,
    @Body() dto: ResetearPasswordDto,
  ) {
    await this.usuariosService.resetearPassword(id, dto.passwordNueva);
    return { actualizado: true };
  }

  @Get(':id/permisos')
  permisos(@Param('id') id: string) {
    return this.usuariosService.permisosDe(id);
  }

  @Patch(':id/permisos')
  actualizarPermiso(
    @Param('id') id: string,
    @Body() dto: ActualizarPermisoDto,
    @CurrentUser() admin: UsuarioAutenticado,
  ) {
    return this.usuariosService.actualizarPermiso(id, dto, admin.id);
  }
}
