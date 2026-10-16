import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { EstadoLote } from '../common/enums/estado-lote.enum.js';
import { OrigenLote } from '../common/enums/origen-lote.enum.js';
import { InventarioItem } from './inventario-item.entity.js';

// Solo tiene sentido para ítems tipo animal_vivo (sección 3.2 del
// diseño). Un lote nace en Cuarentena y no aparece como comprable hasta
// que alguien lo pasa a Disponible a mano.
@Entity({ name: 'lotes' })
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventarioItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Relation<InventarioItem>;

  @Column({ type: 'varchar', unique: true, length: 40, name: 'numero_lote' })
  numeroLote: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  proveedor: string | null;

  // Para Contabilidad: define si el lote se asienta como inventario
  // ordinario (NIC 2, comprado) o como activo biológico (NIIF 41,
  // criado/engordado acá). Ver origen-lote.enum.ts. Default 'compra' solo
  // para que `synchronize` no truene con lotes que ya existían antes de
  // este campo — el DTO lo exige siempre de acá en adelante.
  @Column({ type: 'enum', enum: OrigenLote, default: OrigenLote.COMPRA })
  origen: OrigenLote;

  // Costo de compra o valor razonable (según `origen`) por unidad, al
  // momento de ingresar este lote — se guarda acá, no solo en el ítem,
  // para que mortalidad valore cada lote con SU costo real y no con el
  // costo del último lote que haya entrado (que puede ser otro).
  @Column('numeric', {
    precision: 12,
    scale: 2,
    name: 'valor_unitario',
    nullable: true,
  })
  valorUnitario: string | null;

  @Column({ type: 'timestamptz', name: 'fecha_ingreso' })
  fechaIngreso: Date;

  @Column('int', { name: 'cantidad_ingresada' })
  cantidadIngresada: number;

  @Column('int', { name: 'cantidad_disponible' })
  cantidadDisponible: number;

  @Column({ type: 'enum', enum: EstadoLote, default: EstadoLote.CUARENTENA })
  estado: EstadoLote;

  @Column('int', { name: 'dias_cuarentena_recomendados', nullable: true })
  diasCuarentenaRecomendados: number | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
