export type TipoCliente = "detalle" | "mayorista";

export type Cliente = {
  id: string;
  nombre: string;
  email: string;
  tipoCliente: TipoCliente;
  activo: boolean;
  creadoEn: string;
};

export const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  detalle: "Detalle",
  mayorista: "Mayorista",
};
