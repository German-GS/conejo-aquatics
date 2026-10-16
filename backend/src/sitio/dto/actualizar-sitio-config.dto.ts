import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ActualizarSitioConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  heroInsignia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  heroTitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  heroTituloDestacado?: string;

  @IsOptional()
  @IsString()
  heroSubtitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  heroCta1Label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  heroCta2Label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bannerMayoreoTitulo?: string;

  @IsOptional()
  @IsString()
  bannerMayoreoSubtitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  bannerMayoreoCtaLabel?: string;

  @IsOptional()
  @IsString()
  footerDescripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // null = borrar el enlace (no mostrar el ícono en el sitio).
  @IsOptional()
  @IsUrl()
  instagramUrl?: string | null;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string | null;
}
