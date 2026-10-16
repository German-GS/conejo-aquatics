import { IsInt, IsPositive } from 'class-validator';

export class RegistrarMortalidadDto {
  @IsInt()
  @IsPositive({ message: 'La cantidad debe ser mayor a 0.' })
  cantidad: number;
}
