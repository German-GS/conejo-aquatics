import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity.js';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { slugify } from '../common/utils/slugify.js';
import type { CrearCategoriaDto } from './dto/crear-categoria.dto.js';
import type { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto.js';

export type NodoCategoria = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  hijos: NodoCategoria[];
};

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(InventarioItem)
    private readonly itemRepo: Repository<InventarioItem>,
  ) {}

  private listarPlano(): Promise<Categoria[]> {
    return this.categoriaRepo.find({
      relations: { parent: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async arbol(): Promise<NodoCategoria[]> {
    const todas = await this.listarPlano();

    const nodos = new Map<string, NodoCategoria>(
      todas.map((c) => [c.id, { id: c.id, nombre: c.nombre, slug: c.slug, orden: c.orden, hijos: [] }]),
    );

    const raices: NodoCategoria[] = [];
    for (const categoria of todas) {
      const nodo = nodos.get(categoria.id)!;
      if (categoria.parent) {
        nodos.get(categoria.parent.id)?.hijos.push(nodo);
      } else {
        raices.push(nodo);
      }
    }
    return raices;
  }

  async crear(dto: CrearCategoriaDto): Promise<Categoria> {
    let parent: Categoria | null = null;
    if (dto.parentId) {
      parent = await this.categoriaRepo.findOneBy({ id: dto.parentId });
      if (!parent) throw new NotFoundException('Categoría padre no encontrada.');
    }

    const slug = await this.generarSlugUnico(dto.nombre);
    const categoria = this.categoriaRepo.create({
      nombre: dto.nombre,
      slug,
      parent,
      orden: dto.orden ?? 0,
    });
    return this.categoriaRepo.save(categoria);
  }

  async actualizar(id: string, dto: ActualizarCategoriaDto): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findOneBy({ id });
    if (!categoria) throw new NotFoundException('Categoría no encontrada.');

    if (dto.nombre !== undefined) categoria.nombre = dto.nombre;
    if (dto.orden !== undefined) categoria.orden = dto.orden;

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        categoria.parent = null;
      } else {
        if (dto.parentId === id) {
          throw new BadRequestException('Una categoría no puede ser su propio padre.');
        }
        const nuevoParent = await this.categoriaRepo.findOneBy({ id: dto.parentId });
        if (!nuevoParent) throw new NotFoundException('Categoría padre no encontrada.');
        if (await this.esDescendiente(dto.parentId, id)) {
          throw new BadRequestException(
            'No se puede mover una categoría dentro de una de sus propias subcategorías.',
          );
        }
        categoria.parent = nuevoParent;
      }
    }

    return this.categoriaRepo.save(categoria);
  }

  async eliminar(id: string): Promise<void> {
    const categoria = await this.categoriaRepo.findOneBy({ id });
    if (!categoria) throw new NotFoundException('Categoría no encontrada.');

    const tieneHijos = await this.categoriaRepo.exists({
      where: { parent: { id } },
    });
    if (tieneHijos) {
      throw new BadRequestException(
        'Esta categoría tiene subcategorías — borrá o movés esas primero.',
      );
    }

    const tieneItems = await this.itemRepo.exists({
      where: { categoria: { id } },
    });
    if (tieneItems) {
      throw new BadRequestException(
        'Hay productos del inventario clasificados en esta categoría — reclasificalos antes de borrarla.',
      );
    }

    await this.categoriaRepo.remove(categoria);
  }

  /** ¿`posibleDescendienteId` está en el subárbol de `raizId`? */
  private async esDescendiente(
    posibleDescendienteId: string,
    raizId: string,
  ): Promise<boolean> {
    if (posibleDescendienteId === raizId) return true;
    const hijosDirectos = await this.categoriaRepo.find({
      where: { parent: { id: raizId } },
    });
    for (const hijo of hijosDirectos) {
      if (await this.esDescendiente(posibleDescendienteId, hijo.id)) return true;
    }
    return false;
  }

  private async generarSlugUnico(nombre: string): Promise<string> {
    const base = slugify(nombre) || 'categoria';
    let slug = base;
    let sufijo = 1;
    while (await this.categoriaRepo.findOneBy({ slug })) {
      sufijo += 1;
      slug = `${base}-${sufijo}`;
    }
    return slug;
  }
}
