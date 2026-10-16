import { IsString, MinLength } from 'class-validator';

// Para cuando un administrador resetea la contraseña de OTRO usuario —
// a diferencia de CambiarPasswordDto (auth/dto, autoservicio), acá no
// hace falta la contraseña actual: quien llega hasta acá ya pasó
// RequireRole(ADMINISTRADOR) en el controller.
export class ResetearPasswordDto {
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  passwordNueva: string;
}
