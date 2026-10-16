import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Loader2, Plus, Printer, Search } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatColones } from "@/lib/format";
import {
  ESTADO_COBRO_LABELS,
  abrirPdfFactura,
  descargarPdfFactura,
  numeroFactura,
  type Factura,
} from "@/lib/facturas";
import { NuevaFacturaModal } from "@/components/facturacion/NuevaFacturaModal";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FacturacionPage() {
  const [facturas, setFacturas] = useState<Factura[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pendiente, setPendiente] = useState<string | null>(null);

  async function cargar() {
    try {
      setFacturas(await api.get<Factura[]>("/facturas"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar las facturas.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const facturasFiltradas = useMemo(() => {
    if (!facturas) return null;
    const q = busqueda.trim().toLowerCase();
    if (!q) return facturas;
    return facturas.filter(
      (f) =>
        f.cliente.nombre.toLowerCase().includes(q) ||
        numeroFactura(f.numeroConsecutivo).includes(q),
    );
  }, [facturas, busqueda]);

  async function alternarCobro(factura: Factura) {
    setPendiente(factura.id);
    setError(null);
    try {
      const nuevoEstado = factura.estadoCobro === "cobrada" ? "por_cobrar" : "cobrada";
      const actualizada = await api.patch<Factura>(`/facturas/${factura.id}`, {
        estadoCobro: nuevoEstado,
      });
      setFacturas((prev) => prev?.map((f) => (f.id === factura.id ? actualizada : f)) ?? prev);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el estado.");
    } finally {
      setPendiente(null);
    }
  }

  async function verPdf(factura: Factura) {
    try {
      await abrirPdfFactura(api.getBlob, factura.id);
    } catch {
      setError("No se pudo abrir el PDF.");
    }
  }

  async function bajarPdf(factura: Factura) {
    try {
      await descargarPdfFactura(api.getBlob, factura.id, factura.numeroConsecutivo);
    } catch {
      setError("No se pudo descargar el PDF.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-abyss-900">
            Facturación
          </h1>
          <p className="mt-1 text-sm text-abyss-900/55">
            Facturas de venta con numeración consecutiva, imprimibles y
            exportables en PDF.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20"
        >
          <Plus className="h-4 w-4" />
          Nueva factura de venta
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/30" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cliente o N.° de factura…"
          className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-abyss-900/5 bg-mist-50/60 text-xs font-semibold uppercase tracking-wide text-abyss-900/45">
              <tr>
                <th className="px-5 py-3">N.°</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Creación</th>
                <th className="px-5 py-3">Vencimiento</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-abyss-900/5">
              {facturasFiltradas?.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-mist-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs text-abyss-900/60">
                    {numeroFactura(f.numeroConsecutivo)}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-abyss-900">{f.cliente.nombre}</p>
                    <p className="text-xs text-abyss-900/45">{f.cliente.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-abyss-900/60">
                    {formatFecha(f.fechaEmision)}
                  </td>
                  <td className="px-5 py-3.5 text-abyss-900/60">
                    {f.fechaVencimiento ? formatFecha(f.fechaVencimiento) : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-abyss-900">
                    {formatColones(Number(f.total))}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      disabled={pendiente === f.id}
                      onClick={() => alternarCobro(f)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        f.estadoCobro === "cobrada"
                          ? "bg-seafoam-50 text-seafoam-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {pendiente === f.id && <Loader2 className="h-3 w-3 animate-spin" />}
                      {ESTADO_COBRO_LABELS[f.estadoCobro]}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => verPdf(f)}
                        title="Ver / imprimir"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => bajarPdf(f)}
                        title="Descargar PDF"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!facturasFiltradas && (
          <p className="px-5 py-10 text-center text-sm text-abyss-900/40">Cargando…</p>
        )}

        {facturasFiltradas?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <FileText className="h-8 w-8 text-abyss-900/20" />
            <p className="text-sm text-abyss-900/45">
              {busqueda
                ? "Ninguna factura coincide con esa búsqueda."
                : 'Todavía no hay facturas — creá la primera con "Nueva factura de venta".'}
            </p>
          </div>
        )}
      </div>

      {modalAbierto && (
        <NuevaFacturaModal
          onClose={() => setModalAbierto(false)}
          onCreated={() => {
            setModalAbierto(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}
