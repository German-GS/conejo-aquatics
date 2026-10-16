import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TipoCliente } from '../../common/enums/tipo-cliente.enum.js';

// Solo lo que el personal puede tocar desde el panel — el cliente sigue
// siendo dueño de su nombre/correo/contraseña (eso se edita, si acaso,
// desde su propia sesión, no desde acá).
export class ActualizarClienteDto {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  // Pasar a Mayorista deja de ser una pregunta abierta: ahora es el
  // administrador o quien tenga clientes.gestionar quien lo aprueba acá.
  @IsOptional()
  @IsEnum(TipoCliente)
  tipoCliente?: TipoCliente;
}
