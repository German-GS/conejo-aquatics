import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permiso } from '../common/enums/permiso.enum.js';
import { ContabilidadService } from './contabilidad.service.js';

@Controller('contabilidad')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permiso.CONTABILIDAD_VER)
export class ContabilidadController {
  constructor(private readonly contabilidadService: ContabilidadService) {}

  @Get('cuentas')
  async cuentas() {
    const [cuentas, saldos] = await Promise.all([
      this.contabilidadService.listarCuentas(),
      this.contabilidadService.saldosPorCuenta(),
    ]);
    return cuentas.map((cuenta) => ({
      id: cuenta.id,
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      naturaleza: cuenta.naturaleza,
      activa: cuenta.activa,
      saldo: saldos.get(cuenta.codigo) ?? 0,
    }));
  }

  @Get('asientos')
  asientos(@Query('limite') limite?: string) {
    const n = limite ? Number(limite) : undefined;
    return this.contabilidadService.listarAsientos(
      n && Number.isFinite(n) ? n : undefined,
    );
  }
}
