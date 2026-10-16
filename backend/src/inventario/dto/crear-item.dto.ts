import { IsBoolean, IsEnum, IsOptional, IsPositive, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { TipoItem } from '../../common/enums/tipo-item.enum.js';
import { UnidadMedida } from '../../common/enums/unidad-medida.enum.js';

// Sin `stock`: un ítem nuevo siempre arranca en 0. El stock se agrega
// después con un ingreso real (POST /inventario/:id/lotes para animales
// vivos, POST /inventario/:id/ingreso para mercancía general), para que
// quede su propio movimiento en el kardex desde el primer momento.
export class CrearItemDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  codigo?: string;

  @IsEnum(TipoItem)
  tipo: TipoItem;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidadMedida?: UnidadMedida;

  @IsPositive({ message: 'El precio de detalle debe ser mayor a 0.' })
  precioDetalle: number;

  @IsPositive({ message: 'El precio de mayoreo debe ser mayor a 0.' })
  precioMayoreo: number;

  @IsOptional()
  @Min(0)
  costoUnitario?: number;

  // Dónde va a aparecer en el navbar del sitio (sección/subsección). Se
  // puede dejar sin clasificar y asignarla después.
  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;
}
