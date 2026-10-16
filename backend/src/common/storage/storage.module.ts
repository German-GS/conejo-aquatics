import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { UploadsController } from './uploads.controller.js';

@Global()
@Module({
  providers: [StorageService],
  controllers: [UploadsController],
  exports: [StorageService],
})
export class StorageModule {}
