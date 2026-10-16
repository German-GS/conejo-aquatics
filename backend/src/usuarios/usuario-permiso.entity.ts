import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Permiso } from '../common/enums/permiso.enum.js';
import { Usuario } from './usuario.entity.js';

// Override puntual de un permiso para UN usuario, por encima de lo que
// le da su rol por defecto (PERMISOS_POR_DEFECTO). `concedido: true` lo
// otorga aunque el rol no lo traiga (ej. un bodeguero autorizado a
// eliminar inventario); `concedido: false` se lo quita aunque el rol sí
// lo traiga. Queda quién y cuándo lo autorizó, para trazabilidad.
@Entity({ name: 'usuario_permisos' })
@Unique(['usuario', 'permiso'])
export class UsuarioPermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.permisos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<Usuario>;

  @Column({ type: 'enum', enum: Permiso })
  permiso: Permiso;

  @Column({ type: 'boolean' })
  concedido: boolean;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'otorgado_por_id' })
  otorgadoPor: Relation<Usuario> | null;

  @CreateDateColumn({ name: 'otorgado_en' })
  otorgadoEn: Date;
}
