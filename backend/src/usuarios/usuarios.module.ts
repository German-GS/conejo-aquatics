import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Usuario } from './usuario.entity.js';
import { UsuarioPermiso } from './usuario-permiso.entity.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioPermiso]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
