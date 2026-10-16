import { IsBoolean, IsEnum } from 'class-validator';
import { Permiso } from '../../common/enums/permiso.enum.js';

// Lo que manda un administrador para otorgar o revocar un permiso puntual
// a otro usuario (ej. autorizar a un bodeguero a eliminar inventario).
export class ActualizarPermisoDto {
  @IsEnum(Permiso)
  permiso: Permiso;

  @IsBoolean()
  concedido: boolean;
}
