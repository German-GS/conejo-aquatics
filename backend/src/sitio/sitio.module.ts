import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { SitioConfig } from './sitio-config.entity.js';
import { SitioService } from './sitio.service.js';
import { SitioController } from './sitio.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SitioConfig]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [SitioService],
  controllers: [SitioController],
  exports: [SitioService],
})
export class SitioModule {}
