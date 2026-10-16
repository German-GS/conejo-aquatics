import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoCliente } from '../common/enums/tipo-cliente.enum.js';

// Cuenta de un cliente de la tienda en línea — separada por completo de
// Usuario (cuentas del personal: administrador/bodeguero/vendedor). Un
// cliente nunca tiene permisos ni acceso al panel administrativo; solo
// puede comprar y ver sus propios datos.
@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', unique: true, length: 160 })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: TipoCliente,
    default: TipoCliente.DETALLE,
  })
  tipoCliente: TipoCliente;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
