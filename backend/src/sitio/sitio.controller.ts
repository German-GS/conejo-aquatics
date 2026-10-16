import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SitioService } from './sitio.service.js';
import { ActualizarSitioConfigDto } from './dto/actualizar-sitio-config.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permiso } from '../common/enums/permiso.enum.js';

@Controller('configuracion/sitio')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permiso.CATALOGO_GESTIONAR)
export class SitioController {
  constructor(private readonly sitioService: SitioService) {}

  @Get()
  obtener() {
    return this.sitioService.obtener();
  }

  @Patch()
  actualizar(@Body() dto: ActualizarSitioConfigDto) {
    return this.sitioService.actualizar(dto);
  }
}
