import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';
import { OrigenLote } from '../../common/enums/origen-lote.enum.js';

export class IngresarLoteDto {
  @IsInt()
  @IsPositive({ message: 'La cantidad ingresada debe ser mayor a 0.' })
  cantidadIngresada: number;

  @IsEnum(OrigenLote)
  origen: OrigenLote;

  @IsOptional()
  @IsString()
  @MinLength(2)
  proveedor?: string;

  // Costo de compra o valor razonable estimado (si es producción propia)
  // por unidad. Obligatorio: sin esto, Contabilidad no puede asentar el
  // ingreso del lote.
  @Min(0)
  costoUnitario: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  diasCuarentenaRecomendados?: number;
}
