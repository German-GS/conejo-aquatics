import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Readable } from 'node:stream';
import { FacturasService } from './facturas.service.js';
import { CrearFacturaDto } from './dto/crear-factura.dto.js';
import { ActualizarFacturaDto } from './dto/actualizar-factura.dto.js';
import { generarFacturaPdf } from './factura-pdf.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Permiso } from '../common/enums/permiso.enum.js';
import type { UsuarioAutenticado } from '../auth/usuario-autenticado.interface.js';

@Controller('facturas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permiso.FACTURACION_GESTIONAR)
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Get()
  listar() {
    return this.facturasService.listar();
  }

  @Post()
  crear(@Body() dto: CrearFacturaDto, @CurrentUser() usuario: UsuarioAutenticado) {
    return this.facturasService.crear(dto, usuario.id);
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    return this.facturasService.buscar(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarFacturaDto) {
    return this.facturasService.actualizar(id, dto);
  }

  @Get(':id/pdf')
  async pdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const factura = await this.facturasService.buscar(id);
    const documento = generarFacturaPdf(factura);
    const numero = String(factura.numeroConsecutivo).padStart(6, '0');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="factura-${numero}.pdf"`,
    });
    return new StreamableFile(documento as unknown as Readable);
  }
}
