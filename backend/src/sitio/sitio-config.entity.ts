import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// Fila única (singleton) con el contenido editable del sitio público —
// portada, banner de mayoreo y datos de contacto del pie de página.
// `SitioService.obtener()` la crea con estos valores por defecto la
// primera vez que se pide o se edita, así el sitio nunca queda sin texto.
@Entity({ name: 'sitio_config' })
export class SitioConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, default: '🐠 Nuevos ingresos cada semana' })
  heroInsignia: string;

  @Column({ type: 'varchar', length: 160, default: 'Todo para tu acuario,' })
  heroTitulo: string;

  @Column({ type: 'varchar', length: 160, default: 'directo del experto' })
  heroTituloDestacado: string;

  @Column({
    type: 'text',
    default:
      'Peces, plantas, alimento y equipo con trazabilidad por lote y cuarentena verificada. Venta al detalle en tienda y al por mayor para otros negocios, con factura electrónica en cada compra.',
  })
  heroSubtitulo: string;

  @Column({ type: 'varchar', length: 60, default: 'Ver catálogo' })
  heroCta1Label: string;

  @Column({ type: 'varchar', length: 60, default: 'Comprar al por mayor' })
  heroCta2Label: string;

  @Column({ type: 'varchar', length: 160, default: '¿Tenés un pet shop o negocio propio?' })
  bannerMayoreoTitulo: string;

  @Column({
    type: 'text',
    default:
      'Creá una cuenta mayorista y accedé a precios especiales en todo el catálogo, con factura electrónica en cada pedido.',
  })
  bannerMayoreoSubtitulo: string;

  @Column({ type: 'varchar', length: 60, default: 'Solicitar cuenta mayorista' })
  bannerMayoreoCtaLabel: string;

  @Column({
    type: 'text',
    default:
      'Peces, plantas y equipo para tu acuario. Venta al detalle y al por mayor, con trazabilidad y factura electrónica.',
  })
  footerDescripcion: string;

  @Column({ type: 'varchar', length: 160, default: 'San José, Costa Rica' })
  direccion: string;

  @Column({ type: 'varchar', length: 40, default: '+506 0000-0000' })
  telefono: string;

  @Column({ type: 'varchar', length: 120, default: 'hola@conejoaquatics.cr' })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  instagramUrl: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  facebookUrl: string | null;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
