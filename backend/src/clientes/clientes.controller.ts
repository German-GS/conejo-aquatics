import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service.js';
import { RegistroClienteDto } from './dto/registro-cliente.dto.js';
import { LoginClienteDto } from './dto/login-cliente.dto.js';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto.js';
import { CrearClienteDto } from './dto/crear-cliente.dto.js';
import { ClienteAuthGuard } from './guards/cliente-auth.guard.js';
import { CurrentCliente } from './decorators/current-cliente.decorator.js';
import type { ClienteAutenticado } from './cliente-autenticado.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permiso } from '../common/enums/permiso.enum.js';

// Sin JwtAuthGuard del personal a nivel de clase a propósito: registro,
// login y "me" son para clientes de la tienda en línea, sin sesión de
// personal. El registro y la edición SÍ requieren sesión de personal —
// se declaran por método, no acá.
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post('registro')
  registrar(@Body() dto: RegistroClienteDto) {
    return this.clientesService.registrar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginClienteDto) {
    return this.clientesService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(ClienteAuthGuard)
  me(@CurrentCliente() cliente: ClienteAutenticado) {
    return cliente;
  }

  // --- Panel administrativo ---

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permiso.CLIENTES_GESTIONAR)
  crear(@Body() dto: CrearClienteDto) {
    return this.clientesService.crearDesdeAdmin(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permiso.CLIENTES_GESTIONAR)
  listar() {
    return this.clientesService.listar();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permiso.CLIENTES_GESTIONAR)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarClienteDto) {
    return this.clientesService.actualizar(id, dto);
  }
}
