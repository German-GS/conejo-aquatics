import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import type { Express } from 'express';
import { InventarioService } from './inventario.service.js';
import { ImportacionInventarioService } from './importacion-inventario.service.js';
import { StorageService } from '../common/storage/storage.service.js';
import { CrearItemDto } from './dto/crear-item.dto.js';
import { ActualizarItemDto } from './dto/actualizar-item.dto.js';
import { IngresarLoteDto } from './dto/ingresar-lote.dto.js';
import { IngresarStockDto } from './dto/ingresar-stock.dto.js';
import { AjustarStockDto } from './dto/ajustar-stock.dto.js';
import { RegistrarMortalidadDto } from './dto/registrar-mortalidad.dto.js';
import { ConfirmarImportacionDto } from './dto/importar-inventario.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Permiso } from '../common/enums/permiso.enum.js';
import type { UsuarioAutenticado } from '../auth/usuario-autenticado.interface.js';

@Controller('inventario')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventarioController {
  constructor(
    private readonly inventarioService: InventarioService,
    private readonly importacionService: ImportacionInventarioService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @RequirePermissions(Permiso.INVENTARIO_VER)
  listar() {
    return this.inventarioService.listar();
  }

  // Antes de @Get(':id') a propósito — si no, Nest interpreta "catalogo"
  // como un :id. Sin @RequirePermissions: cualquier usuario logueado
  // puede ver el catálogo (vendedor, bodeguero), aunque no tenga
  // inventario.ver — ver InventarioService.listarCatalogo().
  @Get('catalogo')
  listarCatalogo() {
    return this.inventarioService.listarCatalogo();
  }

  // Para el dashboard — agregado entre todos los ítems, no por uno solo.
  @Get('lotes/cuarentena')
  @RequirePermissions(Permiso.INVENTARIO_VER)
  lotesEnCuarentena() {
    return this.inventarioService.lotesEnCuarentena();
  }

  // --- Importación masiva desde Excel ---
  // Requiere inventario.crear: es, en la práctica, crear muchos ítems a
  // la vez. El archivo se procesa en memoria y se descarta — no queda
  // guardado en el servidor.

  @Post('importar/previsualizar')
  @RequirePermissions(Permiso.INVENTARIO_CREAR)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const permitido =
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          /\.xlsx$/i.test(file.originalname);
        cb(permitido ? null : new BadRequestException('Solo se aceptan archivos .xlsx.'), permitido);
      },
    }),
  )
  previsualizarImportacion(@UploadedFile() archivo: Express.Multer.File) {
    if (!archivo) throw new BadRequestException('No se recibió ningún archivo.');
    return this.importacionService.previsualizar(archivo.buffer);
  }

  @Post('importar/confirmar')
  @RequirePermissions(Permiso.INVENTARIO_CREAR)
  confirmarImportacion(
    @Body() dto: ConfirmarImportacionDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.importacionService.confirmar(dto.filas, usuario.id);
  }

  // Administrador y Bodeguero pueden agregar de entrada (ver
  // permisos-por-defecto.ts); Vendedor no, a menos que se le autorice.
  @Post()
  @RequirePermissions(Permiso.INVENTARIO_CREAR)
  crear(
    @Body() dto: CrearItemDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.inventarioService.crear(dto, usuario.id);
  }

  // --- Lotes (solo animal_vivo) ---

  @Post('lotes/:loteId/disponible')
  @RequirePermissions(Permiso.INVENTARIO_EDITAR)
  pasarLoteADisponible(@Param('loteId') loteId: string) {
    return this.inventarioService.pasarLoteADisponible(loteId);
  }

  @Post('lotes/:loteId/mortalidad')
  @RequirePermissions(Permiso.INVENTARIO_EDITAR)
  registrarMortalidad(
    @Param('loteId') loteId: string,
    @Body() dto: RegistrarMortalidadDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.inventarioService.registrarMortalidad(loteId, dto, usuario.id);
  }

  @Get(':id/lotes')
  @RequirePermissions(Permiso.INVENTARIO_VER)
  listarLotes(@Param('id') id: string) {
    return this.inventarioService.listarLotes(id);
  }

  @Post(':id/lotes')
  @RequirePermissions(Permiso.INVENTARIO_CREAR)
  ingresarLote(
    @Param('id') id: string,
    @Body() dto: IngresarLoteDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.inventarioService.ingresarLote(id, dto, usuario.id);
  }

  // --- Mercancía general (sin lote) ---

  @Post(':id/ingreso')
  @RequirePermissions(Permiso.INVENTARIO_CREAR)
  ingresarStock(
    @Param('id') id: string,
    @Body() dto: IngresarStockDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.inventarioService.ingresarStock(id, dto, usuario.id);
  }

  @Post(':id/ajuste')
  @RequirePermissions(Permiso.INVENTARIO_EDITAR)
  ajustarStock(
    @Param('id') id: string,
    @Body() dto: AjustarStockDto,
    @CurrentUser() usuario: UsuarioAutenticado,
  ) {
    return this.inventarioService.ajustarStock(id, dto, usuario.id);
  }

  // --- Kardex ---

  @Get(':id/movimientos')
  @RequirePermissions(Permiso.INVENTARIO_VER)
  listarMovimientos(@Param('id') id: string) {
    return this.inventarioService.listarMovimientos(id);
  }

  // --- CRUD base del ítem ---

  @Get(':id')
  @RequirePermissions(Permiso.INVENTARIO_VER)
  buscar(@Param('id') id: string) {
    return this.inventarioService.buscar(id);
  }

  @Patch(':id')
  @RequirePermissions(Permiso.INVENTARIO_EDITAR)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarItemDto) {
    return this.inventarioService.actualizar(id, dto);
  }

  @Post(':id/imagen')
  @RequirePermissions(Permiso.INVENTARIO_EDITAR)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const permitido = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
        cb(permitido ? null : new BadRequestException('Solo se aceptan imágenes (JPG, PNG, WEBP, GIF).'), permitido);
      },
    }),
  )
  async subirImagen(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    if (!archivo) throw new BadRequestException('No se recibió ninguna imagen.');
    const extension = extname(archivo.originalname).toLowerCase();
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    await this.storage.guardar(nombre, archivo.buffer);
    return this.inventarioService.guardarImagen(id, `/uploads/inventario/${nombre}`);
  }

  // Solo Administrador por defecto. Un Bodeguero solo llega hasta acá si
  // un administrador le otorgó explícitamente INVENTARIO_ELIMINAR
  // (PATCH /usuarios/:id/permisos) — ver PermissionsGuard.
  @Delete(':id')
  @RequirePermissions(Permiso.INVENTARIO_ELIMINAR)
  async eliminar(@Param('id') id: string) {
    await this.inventarioService.eliminar(id);
    return { eliminado: true };
  }
}
