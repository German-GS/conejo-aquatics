import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class LineaFacturaDto {
  @IsUUID()
  itemId: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  // Si no viene, el precio se toma del producto según el tipo de
  // cliente (detalle/mayoreo) — esto es para cuando el personal negocia
  // un precio puntual distinto.
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;
}

export class CrearFacturaDto {
  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'La factura necesita al menos un producto.' })
  @ValidateNested({ each: true })
  @Type(() => LineaFacturaDto)
  lineas: LineaFacturaDto[];
}
