import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { LineaAsiento } from './linea-asiento.entity.js';

// Un asiento de partida doble. Igual que el kardex de inventario, nunca
// se edita ni se borra — para corregir un error se hace un asiento de
// reversa, nunca se toca uno existente.
@Entity({ name: 'asientos_contables' })
export class AsientoContable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  fecha: Date;

  @Column({ type: 'varchar', length: 240 })
  descripcion: string;

  // Trazabilidad hacia lo que generó el asiento (ej. un movimiento de
  // inventario) — no es una FK real porque el origen puede ser de
  // distintos módulos con el tiempo (inventario, ventas, etc.).
  @Column({ type: 'varchar', length: 60, name: 'origen_tipo', nullable: true })
  origenTipo: string | null;

  @Column({ type: 'uuid', name: 'origen_id', nullable: true })
  origenId: string | null;

  @OneToMany(() => LineaAsiento, (linea) => linea.asiento, { cascade: true })
  lineas: Relation<LineaAsiento>[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
