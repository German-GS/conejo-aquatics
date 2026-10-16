import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Factura } from './factura.entity.js';
import { InventarioItem } from '../inventario/inventario-item.entity.js';

@Entity({ name: 'factura_lineas' })
export class FacturaLinea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Factura, (factura) => factura.lineas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'factura_id' })
  factura: Relation<Factura>;

  // SET NULL a propósito: si el producto se borra del inventario más
  // adelante, la factura histórica no debe desaparecer ni romperse —
  // `descripcion` ya guardó el nombre tal como era al facturar.
  @ManyToOne(() => InventarioItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'item_id' })
  item: Relation<InventarioItem> | null;

  @Column({ type: 'varchar', length: 200 })
  descripcion: string;

  @Column('int')
  cantidad: number;

  @Column('numeric', { precision: 12, scale: 2, name: 'precio_unitario' })
  precioUnitario: string;

  @Column('numeric', { precision: 12, scale: 2 })
  subtotal: string;
}
