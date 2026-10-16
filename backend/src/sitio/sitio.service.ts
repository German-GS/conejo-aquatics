import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitioConfig } from './sitio-config.entity.js';
import type { ActualizarSitioConfigDto } from './dto/actualizar-sitio-config.dto.js';

@Injectable()
export class SitioService {
  constructor(
    @InjectRepository(SitioConfig)
    private readonly repo: Repository<SitioConfig>,
  ) {}

  async obtener(): Promise<SitioConfig> {
    const [existente] = await this.repo.find({ take: 1 });
    if (existente) return existente;
    return this.repo.save(this.repo.create());
  }

  async actualizar(dto: ActualizarSitioConfigDto): Promise<SitioConfig> {
    const config = await this.obtener();

    if (dto.heroInsignia !== undefined) config.heroInsignia = dto.heroInsignia;
    if (dto.heroTitulo !== undefined) config.heroTitulo = dto.heroTitulo;
    if (dto.heroTituloDestacado !== undefined) config.heroTituloDestacado = dto.heroTituloDestacado;
    if (dto.heroSubtitulo !== undefined) config.heroSubtitulo = dto.heroSubtitulo;
    if (dto.heroCta1Label !== undefined) config.heroCta1Label = dto.heroCta1Label;
    if (dto.heroCta2Label !== undefined) config.heroCta2Label = dto.heroCta2Label;

    if (dto.bannerMayoreoTitulo !== undefined) config.bannerMayoreoTitulo = dto.bannerMayoreoTitulo;
    if (dto.bannerMayoreoSubtitulo !== undefined) config.bannerMayoreoSubtitulo = dto.bannerMayoreoSubtitulo;
    if (dto.bannerMayoreoCtaLabel !== undefined) config.bannerMayoreoCtaLabel = dto.bannerMayoreoCtaLabel;

    if (dto.footerDescripcion !== undefined) config.footerDescripcion = dto.footerDescripcion;
    if (dto.direccion !== undefined) config.direccion = dto.direccion;
    if (dto.telefono !== undefined) config.telefono = dto.telefono;
    if (dto.email !== undefined) config.email = dto.email;
    if (dto.instagramUrl !== undefined) config.instagramUrl = dto.instagramUrl;
    if (dto.facebookUrl !== undefined) config.facebookUrl = dto.facebookUrl;

    return this.repo.save(config);
  }
}
