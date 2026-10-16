import { IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CrearCategoriaDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  // Si no viene, es una sección de primer nivel (sin padre).
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
