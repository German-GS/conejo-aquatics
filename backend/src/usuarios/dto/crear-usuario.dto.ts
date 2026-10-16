import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Rol } from '../../common/enums/rol.enum.js';

export class CrearUsuarioDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  @IsEnum(Rol)
  rol: Rol;
}
