export const TIPOS_CUENTA = ["activo", "pasivo", "patrimonio", "ingreso", "gasto"] as const;
export type TipoCuenta = (typeof TIPOS_CUENTA)[number];

export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
  activo: "Activo",
  pasivo: "Pasivo",
  patrimonio: "Patrimonio",
  ingreso: "Ingreso",
  gasto: "Gasto",
};

export type CuentaContable = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: "deudora" | "acreedora";
  activa: boolean;
  saldo: number;
};

export type LineaAsiento = {
  id: string;
  cuenta: { codigo: string; nombre: string };
  debe: string;
  haber: string;
};

export type AsientoContable = {
  id: string;
  fecha: string;
  descripcion: string;
  origenTipo: string | null;
  origenId: string | null;
  lineas: LineaAsiento[];
  creadoEn: string;
};
