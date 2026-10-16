import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Cliente } from './cliente.entity.js';
import { ClientesService } from './clientes.service.js';
import { ClientesController } from './clientes.controller.js';
import { ClienteJwtStrategy } from './cliente-jwt.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    PassportModule.register({ defaultStrategy: 'cliente-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  providers: [ClientesService, ClienteJwtStrategy],
  controllers: [ClientesController],
  exports: [ClientesService],
})
export class ClientesModule {}
