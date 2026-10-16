import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoCuenta {
  ACTIVO = 'activo',
  PASIVO = 'pasivo',
  PATRIMONIO = 'patrimonio',
  INGRESO = 'ingreso',
  GASTO = 'gasto',
}

// Define de qué lado crece la cuenta: una de naturaleza deudora aumenta
// con el debe (ej. activos, gastos); una acreedora aumenta con el haber
// (ej. pasivos, patrimonio, ingresos). Se usa para calcular el saldo.
export enum NaturalezaCuenta {
  DEUDORA = 'deudora',
  ACREEDORA = 'acreedora',
}

@Entity({ name: 'cuentas_contables' })
export class CuentaContable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 160 })
  nombre: string;

  @Column({ type: 'enum', enum: TipoCuenta })
  tipo: TipoCuenta;

  @Column({ type: 'enum', enum: NaturalezaCuenta })
  naturaleza: NaturalezaCuenta;

  @Column({ type: 'boolean', default: true })
  activa: boolean;
}
