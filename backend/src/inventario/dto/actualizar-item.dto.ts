import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';
import { CrearItemDto } from './crear-item.dto.js';

export class ActualizarItemDto extends PartialType(
  OmitType(CrearItemDto, ['categoriaId'] as const),
) {
  // Aparte del resto (que PartialType ya vuelve opcional): acá además
  // admite `null` explícito para poder quitarle la categoría a un ítem,
  // no solo cambiarla o dejarla como está.
  @IsOptional()
  @IsUUID()
  categoriaId?: string | null;
}
