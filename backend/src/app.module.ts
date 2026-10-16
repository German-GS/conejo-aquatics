import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { InventarioModule } from './inventario/inventario.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { PublicoModule } from './publico/publico.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { AccesoModule } from './acceso/acceso.module.js';
import { ContabilidadModule } from './contabilidad/contabilidad.module.js';
import { SitioModule } from './sitio/sitio.module.js';
import { FacturacionModule } from './facturacion/facturacion.module.js';
import { StorageModule } from './common/storage/storage.module.js';
import { Usuario } from './usuarios/usuario.entity.js';
import { UsuarioPermiso } from './usuarios/usuario-permiso.entity.js';
import { InventarioItem } from './inventario/inventario-item.entity.js';
import { Lote } from './inventario/lote.entity.js';
import { MovimientoInventario } from './inventario/movimiento-inventario.entity.js';
import { Categoria } from './catalogo/categoria.entity.js';
import { Cliente } from './clientes/cliente.entity.js';
import { CuentaContable } from './contabilidad/cuenta-contable.entity.js';
import { AsientoContable } from './contabilidad/asiento-contable.entity.js';
import { LineaAsiento } from './contabilidad/linea-asiento.entity.js';
import { SitioConfig } from './sitio/sitio-config.entity.js';
import { Factura } from './facturacion/factura.entity.js';
import { FacturaLinea } from './facturacion/factura-linea.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
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
          SitioConfig,
          Factura,
          FacturaLinea,
        ],
        // Solo en desarrollo: sincroniza el esquema desde las entidades
        // sin migraciones manuales. Antes de producción esto se reemplaza
        // por migraciones versionadas (mismo patrón que Conejo Motors).
        synchronize: true,
      }),
    }),
    AuthModule,
    UsuariosModule,
    InventarioModule,
    CatalogoModule,
    PublicoModule,
    ClientesModule,
    AccesoModule,
    ContabilidadModule,
    SitioModule,
    FacturacionModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
