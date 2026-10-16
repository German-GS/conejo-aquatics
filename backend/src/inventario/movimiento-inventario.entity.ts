import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { TipoMovimiento } from '../common/enums/tipo-movimiento.enum.js';
import { InventarioItem } from './inventario-item.entity.js';
import { Lote } from './lote.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';

// El kardex: fuente de verdad de todo cambio de stock (principio 5 del
// diseño). Nunca se edita ni se borra un movimiento — para corregir un
// error se agrega un movimiento contrario, igual que en Conejo Motors.
@Entity({ name: 'movimientos_inventario' })
export class MovimientoInventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventarioItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Relation<InventarioItem>;

  @ManyToOne(() => Lote, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lote_id' })
  lote: Relation<Lote> | null;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo: TipoMovimiento;

  // Positivo entra, negativo sale.
  @Column('int')
  cantidad: number;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    name: 'costo_unitario',
    nullable: true,
  })
  costoUnitario: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Relation<Usuario> | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
