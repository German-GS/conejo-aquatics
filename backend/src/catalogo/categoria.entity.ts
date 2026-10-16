import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

// Árbol de secciones/subsecciones del catálogo (ej. Seres vivos > Marino >
// Invertebrados). Cada categoría puede tener un padre — sin padre es una
// "sección" de primer nivel (aparece directo en el navbar del sitio);
// con padre es una subsección (aparece como submenú). No hay límite de
// profundidad: si alguien necesita un cuarto nivel, simplemente crea una
// categoría con padre en el tercer nivel.
@Entity({ name: 'categorias' })
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', unique: true, length: 140 })
  slug: string;

  @ManyToOne(() => Categoria, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parent_id' })
  parent: Relation<Categoria> | null;

  @Column('int', { default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
