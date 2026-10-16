export type EstadoCobroFactura = "por_cobrar" | "cobrada";

export const ESTADO_COBRO_LABELS: Record<EstadoCobroFactura, string> = {
  por_cobrar: "Por cobrar",
  cobrada: "Cobrada",
};

export type FacturaLinea = {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
};

export type Factura = {
  id: string;
  numeroConsecutivo: number;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    tipoCliente: "detalle" | "mayorista";
  };
  fechaEmision: string;
  fechaVencimiento: string | null;
  lineas: FacturaLinea[];
  total: string;
  estadoCobro: EstadoCobroFactura;
  creadoEn: string;
};

export function numeroFactura(n: number): string {
  return String(n).padStart(6, "0");
}

export async function abrirPdfFactura(
  getBlob: (path: string) => Promise<Blob>,
  facturaId: string,
): Promise<void> {
  // window.open ANTES del await a propósito: los navegadores solo dejan
  // abrir una pestaña sin bloquearla como popup durante el mismo tick
  // del gesto de clic — si se llama después de esperar el fetch, ya se
  // perdió ese permiso y se bloquea en silencio.
  const ventana = window.open("", "_blank");
  const blob = await getBlob(`/facturas/${facturaId}/pdf`);
  const url = URL.createObjectURL(blob);
  if (ventana) {
    ventana.location.href = url;
  } else {
    window.open(url, "_blank");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function descargarPdfFactura(
  getBlob: (path: string) => Promise<Blob>,
  facturaId: string,
  numero: number,
): Promise<void> {
  const blob = await getBlob(`/facturas/${facturaId}/pdf`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `factura-${numeroFactura(numero)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
