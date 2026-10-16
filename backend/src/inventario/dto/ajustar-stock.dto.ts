import { IsEnum, IsInt } from 'class-validator';

export enum MotivoAjuste {
  MERMA = 'merma',
  CONTEO = 'conteo',
}

export class AjustarStockDto {
  // Puede ser negativo (se perdió/dañó mercancía) o positivo (el conteo
  // físico encontró más de lo que el sistema tenía registrado).
  @IsInt()
  cantidad: number;

  @IsEnum(MotivoAjuste)
  motivo: MotivoAjuste;
}
