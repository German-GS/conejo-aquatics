import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { EstadoCobroFactura } from '../common/enums/estado-cobro-factura.enum.js';
import { FacturaLinea } from './factura-linea.entity.js';

// Facturación interna — documento de venta con numeración consecutiva,
// imprimible/exportable en PDF. NO es factura electrónica ante Hacienda
// (eso necesita certificado digital, XML firmado y CABYS por línea —
// un proyecto aparte, más grande y regulado). El "N.° de factura" acá
// es un consecutivo propio del sistema, no el consecutivo de 20 dígitos
// que exige el Ministerio de Hacienda.
@Entity({ name: 'facturas' })
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Respaldado por una secuencia de Postgres (vía @Generated) — atómico
  // bajo concurrencia, nunca se repite. Puede tener saltos si una
  // creación falla a medio camino; normal en este tipo de numeración.
  @Column({ type: 'int', unique: true })
  @Generated('increment')
  numeroConsecutivo: number;

  @ManyToOne(() => Cliente, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Relation<Cliente>;

  @Column({ type: 'date', name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ type: 'date', name: 'fecha_vencimiento', nullable: true })
  fechaVencimiento: Date | null;

  @OneToMany(() => FacturaLinea, (linea) => linea.factura, { cascade: true })
  lineas: Relation<FacturaLinea>[];

  @Column('numeric', { precision: 12, scale: 2 })
  total: string;

  @Column({
    type: 'enum',
    enum: EstadoCobroFactura,
    default: EstadoCobroFactura.POR_COBRAR,
  })
  estadoCobro: EstadoCobroFactura;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por' })
  creadoPor: Relation<Usuario>;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
