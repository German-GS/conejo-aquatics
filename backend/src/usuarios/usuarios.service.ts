import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity.js';
import { UsuarioPermiso } from './usuario-permiso.entity.js';
import type { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import type { ActualizarPermisoDto } from './dto/actualizar-permiso.dto.js';
import type { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import type { CambiarPasswordDto } from '../auth/dto/cambiar-password.dto.js';
import { permisosEfectivos } from '../common/permisos/permisos.util.js';
import { Rol } from '../common/enums/rol.enum.js';

const SALT_ROUNDS = 12;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioPermiso)
    private readonly permisoRepo: Repository<UsuarioPermiso>,
  ) {}

  async crear(dto: CrearUsuarioDto): Promise<Usuario> {
    const existente = await this.usuarioRepo.findOneBy({ email: dto.email });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese correo.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const usuario = this.usuarioRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      rol: dto.rol,
    });
    return this.usuarioRepo.save(usuario);
  }

  async actualizar(
    id: string,
    dto: ActualizarUsuarioDto,
    solicitanteId: string,
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    if (dto.email && dto.email !== usuario.email) {
      const conEseCorreo = await this.usuarioRepo.findOneBy({
        email: dto.email,
      });
      if (conEseCorreo) {
        throw new ConflictException('Ya existe un usuario con ese correo.');
      }
    }

    // Si esto deja de ser administrador (por rol o por desactivarse),
    // no puede ser el último — si no, nadie más podría volver a gestionar
    // usuarios ni recuperar el acceso.
    const dejaDeSerAdminActivo =
      usuario.rol === Rol.ADMINISTRADOR &&
      ((dto.rol && dto.rol !== Rol.ADMINISTRADOR) || dto.activo === false);
    if (dejaDeSerAdminActivo) {
      const otrosAdmins = await this.contarAdministradoresActivos(id);
      if (otrosAdmins === 0) {
        throw new BadRequestException(
          'No podés dejar sin administradores activos al sistema.',
        );
      }
    }

    if (id === solicitanteId && (dto.rol || dto.activo === false)) {
      throw new BadRequestException(
        'No podés cambiar tu propio rol ni desactivar tu propia cuenta.',
      );
    }

    // OJO: no usar Object.assign(usuario, dto) acá. class-transformer deja
    // en el DTO, como propiedad propia con valor `undefined`, cada campo
    // que la clase declara pero que no vino en el body — Object.assign
    // copiaría esos `undefined` y borraría datos reales del usuario que
    // no se estaban tocando. Por eso se asigna campo por campo, solo si
    // vino definido.
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.email !== undefined) usuario.email = dto.email;
    if (dto.rol !== undefined) usuario.rol = dto.rol;
    if (dto.activo !== undefined) usuario.activo = dto.activo;

    return this.usuarioRepo.save(usuario);
  }

  /**
   * Cualquier usuario, sin importar el rol, puede cambiar su PROPIA
   * contraseña — es lo único que un bodeguero o vendedor puede tocar de
   * sí mismo sin pasar por un administrador.
   */
  async cambiarPassword(
    usuarioId: string,
    dto: CambiarPasswordDto,
  ): Promise<void> {
    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    const passwordValida = await bcrypt.compare(
      dto.passwordActual,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Tu contraseña actual no es correcta.');
    }

    usuario.passwordHash = await bcrypt.hash(dto.passwordNueva, SALT_ROUNDS);
    await this.usuarioRepo.save(usuario);
  }

  /**
   * A diferencia de cambiarPassword(), esto lo hace un administrador
   * sobre la cuenta de OTRO usuario (ej. se le olvidó, o como pasó con
   * la cuenta admin de producción: nadie tenía anotada la contraseña) —
   * no se le pide la contraseña actual.
   */
  async resetearPassword(id: string, passwordNueva: string): Promise<void> {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    usuario.passwordHash = await bcrypt.hash(passwordNueva, SALT_ROUNDS);
    await this.usuarioRepo.save(usuario);
  }

  async eliminar(id: string, solicitanteId: string): Promise<void> {
    if (id === solicitanteId) {
      throw new BadRequestException('No podés eliminar tu propia cuenta.');
    }

    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    if (usuario.rol === Rol.ADMINISTRADOR) {
      const otrosAdmins = await this.contarAdministradoresActivos(id);
      if (otrosAdmins === 0) {
        throw new BadRequestException(
          'No podés eliminar al último administrador del sistema.',
        );
      }
    }

    await this.usuarioRepo.remove(usuario);
  }

  private contarAdministradoresActivos(excluyendoId: string): Promise<number> {
    return this.usuarioRepo.count({
      where: { rol: Rol.ADMINISTRADOR, activo: true, id: Not(excluyendoId) },
    });
  }

  async listar(): Promise<Usuario[]> {
    return this.usuarioRepo.find({
      relations: { permisos: true },
      order: { creadoEn: 'DESC' },
    });
  }

  buscarPorEmailConPermisos(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email },
      relations: { permisos: { otorgadoPor: true } },
    });
  }

  buscarPorIdConPermisos(id: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { id },
      relations: { permisos: { otorgadoPor: true } },
    });
  }

  async permisosDe(usuarioId: string) {
    const usuario = await this.buscarPorIdConPermisos(usuarioId);
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    const overrides = usuario.permisos.map((p) => ({
      permiso: p.permiso,
      concedido: p.concedido,
    }));
    return {
      rol: usuario.rol,
      efectivos: [...permisosEfectivos(usuario.rol, overrides)],
      overrides: usuario.permisos.map((p) => ({
        permiso: p.permiso,
        concedido: p.concedido,
        otorgadoPorId: p.otorgadoPor?.id ?? null,
        otorgadoEn: p.otorgadoEn,
      })),
    };
  }

  /**
   * Otorga o revoca un permiso puntual a un usuario. Quien llama a este
   * método ya pasó el RequireRole(ADMINISTRADOR) del controller, así que
   * solo un administrador llega hasta acá.
   */
  async actualizarPermiso(
    usuarioId: string,
    dto: ActualizarPermisoDto,
    otorgadoPorId: string,
  ) {
    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    let override = await this.permisoRepo.findOne({
      where: { usuario: { id: usuarioId }, permiso: dto.permiso },
    });

    if (!override) {
      override = this.permisoRepo.create({
        usuario,
        permiso: dto.permiso,
      });
    }
    override.concedido = dto.concedido;
    override.otorgadoPor = { id: otorgadoPorId } as Usuario;

    await this.permisoRepo.save(override);
    return this.permisosDe(usuarioId);
  }
}
