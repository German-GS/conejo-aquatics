import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoCliente } from '../../common/enums/tipo-cliente.enum.js';

// Para cuando el personal da de alta a un cliente a mano (llamó por
// teléfono, vino a la tienda) en vez de que se registre solo desde la
// tienda en línea. A diferencia de RegistroClienteDto, acá sí se puede
// elegir tipoCliente de entrada — quien atiende ya sabe si es un pet
// shop que compra al mayoreo.
export class CrearClienteDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  @IsOptional()
  @IsEnum(TipoCliente)
  tipoCliente?: TipoCliente;
}
