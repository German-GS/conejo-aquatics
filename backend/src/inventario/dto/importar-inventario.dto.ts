import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Una fila ya interpretada del Excel — lo que vuelve en la previsualización
// y lo que se manda de vuelta para confirmar la importación. `fila` y
// `conflicto` son solo para que el frontend pueda reenviar el mismo
// objeto que recibió en la previsualización sin transformarlo — el
// backend no los necesita (vuelve a validar el código de cada una igual).
export class FilaImportacionDto {
  @IsOptional()
  @IsInt()
  fila?: number;

  @IsOptional()
  @IsBoolean()
  conflicto?: boolean;

  @IsString()
  @MinLength(1)
  categoriaExcel: string;

  @IsString()
  @MinLength(1)
  nombre: string;

  @IsString()
  @MinLength(1)
  codigo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoUnitario?: number;

  @IsNumber()
  @Min(0)
  precioMayoreo: number;
}

export class ConfirmarImportacionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilaImportacionDto)
  filas: FilaImportacionDto[];
}
