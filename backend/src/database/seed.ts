import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/usuario.entity.js';
import { UsuarioPermiso } from '../usuarios/usuario-permiso.entity.js';
import { InventarioItem } from '../inventario/inventario-item.entity.js';
import { Lote } from '../inventario/lote.entity.js';
import { MovimientoInventario } from '../inventario/movimiento-inventario.entity.js';
import { Categoria } from '../catalogo/categoria.entity.js';
import { Cliente } from '../clientes/cliente.entity.js';
import { CuentaContable } from '../contabilidad/cuenta-contable.entity.js';
import { AsientoContable } from '../contabilidad/asiento-contable.entity.js';
import { LineaAsiento } from '../contabilidad/linea-asiento.entity.js';
import { Rol } from '../common/enums/rol.enum.js';

const SALT_ROUNDS = 12;

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
      Usuario,
      UsuarioPermiso,
      InventarioItem,
      Lote,
      MovimientoInventario,
      Categoria,
      Cliente,
      CuentaContable,
      AsientoContable,
      LineaAsiento,
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  const usuarioRepo = dataSource.getRepository(Usuario);

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'Definí ADMIN_SEED_EMAIL y ADMIN_SEED_PASSWORD en backend/.env antes de sembrar.',
    );
  }

  const existente = await usuarioRepo.findOne({ where: { email } });
  if (existente) {
    console.log(`Ya existe un usuario administrador con ${email}, no se creó otro.`);
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = usuarioRepo.create({
    nombre: 'Administración',
    email,
    passwordHash,
    rol: Rol.ADMINISTRADOR,
  });
  await usuarioRepo.save(admin);

  console.log(`Usuario administrador creado: ${email}`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error al sembrar la base de datos:', err);
  process.exit(1);
});
