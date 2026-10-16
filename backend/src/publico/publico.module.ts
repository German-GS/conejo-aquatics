import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { CatalogoModule } from '../catalogo/catalogo.module.js';
import { SitioModule } from '../sitio/sitio.module.js';
import { PublicoService } from './publico.service.js';
import { PublicoController } from './publico.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioItem]), CatalogoModule, SitioModule],
  providers: [PublicoService],
  controllers: [PublicoController],
})
export class PublicoModule {}
