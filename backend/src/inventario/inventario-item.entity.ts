import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { TipoItem } from '../common/enums/tipo-item.enum.js';
import { UnidadMedida } from '../common/enums/unidad-medida.enum.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Categoria } from '../catalogo/categoria.entity.js';

@Entity({ name: 'inventario_items' })
export class InventarioItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  nombre: string;

  // Código interno/SKU para identificar el ítem rápido (ej. en el POS o
  // al buscarlo). No es la clave primaria — es de uso operativo, libre.
  @Column({ type: 'varchar', length: 40, unique: true, nullable: true })
  codigo: string | null;

  @Column({ type: 'enum', enum: TipoItem })
  tipo: TipoItem;

  // Texto libre aparte del nombre — detalles de color, tamaño, cuidados,
  // etc. Nunca se muestra en tablas, solo en el detalle del ítem.
  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  // Cómo se cuenta/vende (pieza, kg, litro...). Por defecto UNIDAD —
  // la gran mayoría de peces, plantas y equipo se maneja por pieza.
  @Column({
    type: 'enum',
    enum: UnidadMedida,
    name: 'unidad_medida',
    default: UnidadMedida.UNIDAD,
  })
  unidadMedida: UnidadMedida;

  // Montos en colones (₡), sin decimales de céntimo en la práctica pero
  // se guarda con 2 decimales por si algún día hace falta precisión.
  @Column('numeric', { precision: 12, scale: 2, name: 'precio_detalle' })
  precioDetalle: string;

  @Column('numeric', { precision: 12, scale: 2, name: 'precio_mayoreo' })
  precioMayoreo: string;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    name: 'costo_unitario',
    nullable: true,
  })
  costoUnitario: string | null;

  // Cache materializado (sección 3.2 del diseño): NO es la fuente de
  // verdad, se recalcula a partir del kardex (MovimientoInventario). No
  // se edita directamente desde el PATCH general del ítem — solo lo
  // tocan los métodos del service que también escriben un movimiento
  // (ingresarLote, ingresarStock, registrarMortalidad, ajustarStock).
  @Column('int', { default: 0 })
  stock: number;

  // Dónde vive en el árbol de secciones/subsecciones del sitio (ver
  // catalogo/categoria.entity.ts). Nullable porque un ítem puede quedar
  // sin clasificar temporalmente, pero sin categoría no aparece en el
  // navbar público.
  @ManyToOne(() => Categoria, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Relation<Categoria> | null;

  // Si aparece en la sección "Destacados" de la página pública.
  @Column({ type: 'boolean', default: false })
  destacado: boolean;

  // Ruta pública de la foto (ej. /uploads/inventario/xxxx.jpg), servida
  // como archivo estático — ver ServeStaticModule en app.module.ts.
  @Column({ type: 'varchar', name: 'imagen_url', nullable: true })
  imagenUrl: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Relation<Usuario> | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
