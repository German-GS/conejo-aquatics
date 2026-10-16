import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { AsientoContable } from './asiento-contable.entity.js';
import { CuentaContable } from './cuenta-contable.entity.js';

@Entity({ name: 'lineas_asiento' })
export class LineaAsiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AsientoContable, (asiento) => asiento.lineas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asiento_id' })
  asiento: Relation<AsientoContable>;

  @ManyToOne(() => CuentaContable, { eager: true })
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: Relation<CuentaContable>;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  debe: string;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  haber: string;
}
