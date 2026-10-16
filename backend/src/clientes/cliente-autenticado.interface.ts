import type { TipoCliente } from '../common/enums/tipo-cliente.enum.js';

export interface ClienteAutenticado {
  id: string;
  nombre: string;
  email: string;
  tipoCliente: TipoCliente;
}
