import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Categoria } from './categoria.entity.js';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { CategoriasService } from './categorias.service.js';
import { CategoriasController } from './categorias.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, InventarioItem]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [CategoriasService],
  controllers: [CategoriasController],
  exports: [CategoriasService],
})
export class CatalogoModule {}
