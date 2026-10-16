import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { CategoriasService } from '../catalogo/categorias.service.js';
import { SitioService } from '../sitio/sitio.service.js';

// Selección de campos "seguros" para exponer sin autenticación: nada de
// costoUnitario, creadoPor, ni nada interno del negocio.
const CAMPOS_PUBLICOS = {
  id: true,
  nombre: true,
  tipo: true,
  precioDetalle: true,
  precioMayoreo: true,
  stock: true,
  imagenUrl: true,
  destacado: true,
  categoria: { id: true, nombre: true, slug: true },
} as const;

@Injectable()
export class PublicoService {
  constructor(
    @InjectRepository(InventarioItem)
    private readonly itemRepo: Repository<InventarioItem>,
    private readonly categoriasService: CategoriasService,
    private readonly sitioService: SitioService,
  ) {}

  categorias() {
    return this.categoriasService.arbol();
  }

  sitioConfig() {
    return this.sitioService.obtener();
  }

  productos(categoriaId?: string) {
    return this.itemRepo.find({
      where: categoriaId ? { categoria: { id: categoriaId } } : {},
      relations: { categoria: true },
      select: CAMPOS_PUBLICOS,
      order: { nombre: 'ASC' },
    });
  }

  destacados() {
    return this.itemRepo.find({
      where: { destacado: true },
      relations: { categoria: true },
      select: CAMPOS_PUBLICOS,
      order: { nombre: 'ASC' },
    });
  }
}
