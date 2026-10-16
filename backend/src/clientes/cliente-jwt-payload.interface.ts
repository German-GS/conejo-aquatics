export interface ClienteJwtPayload {
  sub: string; // cliente.id
  email: string;
  // Discrimina este token de los del personal (JwtPayload en
  // auth/jwt-payload.interface.ts) — un token de cliente nunca debe
  // servir para entrar al panel administrativo, ni viceversa.
  tipo: 'cliente';
}
