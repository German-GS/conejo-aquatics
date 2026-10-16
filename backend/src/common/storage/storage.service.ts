import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

const CARPETA_LOCAL = join(process.cwd(), 'uploads', 'inventario');

const TIPOS: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

// Fotos de inventario. En producción (Cloud Run) el disco es efímero —
// se borra en cada reinicio/redeploy y cada instancia tiene el suyo —
// así que ahí se guardan en un bucket de Cloud Storage (GCS_BUCKET).
// En desarrollo local, sin GCS_BUCKET, siguen yendo a ./uploads/inventario.
@Injectable()
export class StorageService {
  private readonly bucket;

  constructor(config: ConfigService) {
    const nombreBucket = config.get<string>('GCS_BUCKET');
    this.bucket = nombreBucket ? new Storage().bucket(nombreBucket) : null;
  }

  async guardar(nombre: string, contenido: Buffer): Promise<void> {
    if (this.bucket) {
      await this.bucket.file(`inventario/${nombre}`).save(contenido, {
        contentType: this.tipoDe(nombre),
        resumable: false,
      });
      return;
    }
    await mkdir(CARPETA_LOCAL, { recursive: true });
    await writeFile(join(CARPETA_LOCAL, nombre), contenido);
  }

  async leer(nombre: string): Promise<{ stream: Readable; tipo: string } | null> {
    const tipo = this.tipoDe(nombre);
    if (this.bucket) {
      const archivo = this.bucket.file(`inventario/${nombre}`);
      const [existe] = await archivo.exists();
      return existe ? { stream: archivo.createReadStream(), tipo } : null;
    }
    const ruta = join(CARPETA_LOCAL, nombre);
    const existe = await stat(ruta).then(
      (s) => s.isFile(),
      () => false,
    );
    return existe ? { stream: createReadStream(ruta), tipo } : null;
  }

  private tipoDe(nombre: string): string {
    return TIPOS[extname(nombre).toLowerCase()] ?? 'application/octet-stream';
  }
}
