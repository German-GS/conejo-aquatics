import { Controller, Get, NotFoundException, Param, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from './storage.service.js';

// Público a propósito (sin guards): son las fotos de catálogo que
// también muestra el sitio de la tienda, igual que antes con
// useStaticAssets. El nombre tiene que ser un archivo plano — nada de
// rutas — para que nadie pueda salirse de la carpeta con "../".
const NOMBRE_VALIDO = /^[\w.-]+$/;

@Controller('uploads/inventario')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Get(':archivo')
  async servir(
    @Param('archivo') archivo: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (!NOMBRE_VALIDO.test(archivo) || archivo.includes('..')) {
      throw new NotFoundException();
    }
    const encontrado = await this.storage.leer(archivo);
    if (!encontrado) throw new NotFoundException();

    // El nombre lleva timestamp + número al azar: nunca se reutiliza, así
    // que el navegador puede cachearlo para siempre.
    res.set({
      'Content-Type': encontrado.tipo,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    return new StreamableFile(encontrado.stream);
  }
}
