import { IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class ActualizarCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  // undefined = no tocar el padre; null = mover a primer nivel (sin
  // padre); un uuid = mover bajo esa categoría.
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
