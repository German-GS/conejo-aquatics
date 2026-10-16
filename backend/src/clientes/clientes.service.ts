import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cliente } from './cliente.entity.js';
import type { RegistroClienteDto } from './dto/registro-cliente.dto.js';
import type { ActualizarClienteDto } from './dto/actualizar-cliente.dto.js';
import type { CrearClienteDto } from './dto/crear-cliente.dto.js';
import type { ClienteJwtPayload } from './cliente-jwt-payload.interface.js';

const SALT_ROUNDS = 12;

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroClienteDto) {
    const existente = await this.clienteRepo.findOneBy({ email: dto.email });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const cliente = this.clienteRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      // Todo el mundo arranca como Detalle — pasar a Mayorista no es
      // autoservicio todavía (ver nota en tipo-cliente.enum.ts).
    });
    const guardado = await this.clienteRepo.save(cliente);
    return this.emitirSesion(guardado);
  }

  async login(email: string, password: string) {
    const cliente = await this.clienteRepo.findOneBy({ email });
    if (!cliente || !cliente.activo) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const passwordValida = await bcrypt.compare(password, cliente.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    return this.emitirSesion(cliente);
  }

  buscarPorId(id: string): Promise<Cliente | null> {
    return this.clienteRepo.findOneBy({ id });
  }

  // --- Panel administrativo (personal con clientes.gestionar) ---

  async crearDesdeAdmin(dto: CrearClienteDto): Promise<Omit<Cliente, 'passwordHash'>> {
    const existente = await this.clienteRepo.findOneBy({ email: dto.email });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const cliente = this.clienteRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      tipoCliente: dto.tipoCliente,
    });
    const { passwordHash: _passwordHash, ...guardado } = await this.clienteRepo.save(cliente);
    return guardado;
  }

  // Nunca incluir passwordHash en lo que ve el panel.
  listar(): Promise<Cliente[]> {
    return this.clienteRepo.find({
      select: {
        id: true,
        nombre: true,
        email: true,
        tipoCliente: true,
        activo: true,
        creadoEn: true,
      },
      order: { creadoEn: 'DESC' },
    });
  }

  async actualizar(id: string, dto: ActualizarClienteDto): Promise<Omit<Cliente, 'passwordHash'>> {
    const cliente = await this.clienteRepo.findOneBy({ id });
    if (!cliente) throw new NotFoundException('Cliente no encontrado.');

    if (dto.activo !== undefined) cliente.activo = dto.activo;
    if (dto.tipoCliente !== undefined) cliente.tipoCliente = dto.tipoCliente;

    const { passwordHash: _passwordHash, ...guardado } = await this.clienteRepo.save(cliente);
    return guardado;
  }

  private async emitirSesion(cliente: Cliente) {
    const payload: ClienteJwtPayload = {
      sub: cliente.id,
      email: cliente.email,
      tipo: 'cliente',
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        tipoCliente: cliente.tipoCliente,
      },
    };
  }
}
