import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Rol } from '../common/enums/rol.enum.js';
import { UsuarioPermiso } from './usuario-permiso.entity.js';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', unique: true, length: 160 })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: Rol })
  rol: Rol;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => UsuarioPermiso, (permiso) => permiso.usuario)
  permisos: Relation<UsuarioPermiso>[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
