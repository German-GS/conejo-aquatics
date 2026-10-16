import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { TIPO_CLIENTE_LABELS, type Cliente, type TipoCliente } from "@/lib/clientes";
import { NuevoClienteModal } from "@/components/clientes/NuevoClienteModal";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  async function cargar() {
    try {
      setClientes(await api.get<Cliente[]>("/clientes"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar los clientes.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function actualizar(cliente: Cliente, cambios: Partial<Pick<Cliente, "activo" | "tipoCliente">>) {
    setPendiente(cliente.id);
    setError(null);
    try {
      const actualizado = await api.patch<Cliente>(`/clientes/${cliente.id}`, cambios);
      setClientes((prev) => prev?.map((c) => (c.id === cliente.id ? actualizado : c)) ?? prev);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el cliente.");
    } finally {
      setPendiente(null);
    }
  }

  const clientesFiltrados = useMemo(() => {
    if (!clientes) return null;
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [clientes, busqueda]);

  const mayoristasCount = clientes?.filter((c) => c.tipoCliente === "mayorista").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-abyss-900">Clientes</h1>
          <p className="mt-1 text-sm text-abyss-900/55">
            Cuentas de la tienda en línea — activalas/desactivalas y aprobá el paso
            a mayorista
            {clientes && `. ${clientes.length} en total, ${mayoristasCount} mayoristas`}.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20"
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/30" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-abyss-900/5 bg-mist-50/60 text-xs font-semibold uppercase tracking-wide text-abyss-900/45">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Registrado</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-abyss-900/5">
              {clientesFiltrados?.map((cliente) => (
                <tr key={cliente.id} className="transition-colors hover:bg-mist-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-abyss-900">{cliente.nombre}</p>
                    <p className="text-xs text-abyss-900/45">{cliente.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={cliente.tipoCliente}
                      disabled={pendiente === cliente.id}
                      onChange={(e) =>
                        actualizar(cliente, { tipoCliente: e.target.value as TipoCliente })
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none disabled:opacity-50 ${
                        cliente.tipoCliente === "mayorista"
                          ? "bg-ocean-700/10 text-ocean-700"
                          : "bg-mist-100 text-abyss-900/60"
                      }`}
                    >
                      {Object.entries(TIPO_CLIENTE_LABELS).map(([valor, etiqueta]) => (
                        <option key={valor} value={valor}>
                          {etiqueta}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-abyss-900/60">
                    {formatFecha(cliente.creadoEn)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {pendiente === cliente.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-abyss-900/30" />
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cliente.activo}
                        disabled={pendiente === cliente.id}
                        onClick={() => actualizar(cliente, { activo: !cliente.activo })}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                          cliente.activo ? "bg-turquoise-500" : "bg-abyss-900/15"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            cliente.activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-abyss-900/45">
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!clientesFiltrados && (
          <p className="px-5 py-10 text-center text-sm text-abyss-900/40">Cargando…</p>
        )}

        {clientesFiltrados?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Users className="h-8 w-8 text-abyss-900/20" />
            <p className="text-sm text-abyss-900/45">
              {busqueda
                ? "Ningún cliente coincide con esa búsqueda."
                : "Todavía no hay clientes — creá el primero con el botón de arriba."}
            </p>
          </div>
        )}
      </div>

      {modalAbierto && (
        <NuevoClienteModal
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
