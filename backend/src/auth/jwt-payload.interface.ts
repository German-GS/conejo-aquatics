import { Rol } from '../common/enums/rol.enum.js';

export interface JwtPayload {
  sub: string; // usuario.id
  email: string;
  rol: Rol;
}
