import { IsEnum } from 'class-validator';
import { EstadoCobroFactura } from '../../common/enums/estado-cobro-factura.enum.js';

// Por ahora lo único editable después de creada es el estado de cobro
// (marcarla como cobrada) — las líneas y el cliente quedan fijos, igual
// que en cualquier documento de venta ya emitido.
export class ActualizarFacturaDto {
  @IsEnum(EstadoCobroFactura)
  estadoCobro: EstadoCobroFactura;
}
