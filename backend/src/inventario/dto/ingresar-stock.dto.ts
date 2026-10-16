import { IsInt, IsPositive, Min } from 'class-validator';

export class IngresarStockDto {
  @IsInt()
  @IsPositive({ message: 'La cantidad a ingresar debe ser mayor a 0.' })
  cantidad: number;

  // Obligatorio: sin esto, Contabilidad no puede asentar el ingreso.
  @Min(0)
  costoUnitario: number;
}
