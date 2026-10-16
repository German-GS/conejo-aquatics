import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatColones } from "@/lib/format";
import type { Cliente } from "@/lib/clientes";
import type { InventarioItem } from "@/lib/inventario";
import type { Factura } from "@/lib/facturas";

type LineaForm = {
  itemId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  stockDisponible: number;
};

// Sin w-full acá a propósito: dos usos de esta clase viven dentro de un
// <div className="flex">, donde w-full les gana a flex-1/w-20 sin
// importar el orden de las clases (ambas son la propiedad `width`, y
// Tailwind ordena w-full después de w-20 en la hoja de estilos) — el
// input de cantidad terminaba ocupando toda la fila y el select de
// producto quedaba aplastado. Cada uso agrega su propio ancho.
const inputClase =
  "rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20";

export function NuevaFacturaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (factura: Factura) => void;
}) {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [items, setItems] = useState<InventarioItem[] | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [lineas, setLineas] = useState<LineaForm[]>([]);

  const [itemSeleccionado, setItemSeleccionado] = useState("");
  const [cantidadNueva, setCantidadNueva] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Cliente[]>("/clientes"),
      api.get<InventarioItem[]>("/inventario/catalogo"),
    ])
      .then(([c, i]) => {
        setClientes(c);
        setItems(i);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudo cargar clientes/productos."),
      );
  }, []);

  const cliente = clientes?.find((c) => c.id === clienteId) ?? null;

  const itemsDisponibles = useMemo(
    () => items?.filter((i) => !lineas.some((l) => l.itemId === i.id)) ?? [],
    [items, lineas],
  );

  function agregarLinea() {
    const item = items?.find((i) => i.id === itemSeleccionado);
    if (!item || !cliente || cantidadNueva < 1) return;
    const precio = Number(
      cliente.tipoCliente === "mayorista" ? item.precioMayoreo : item.precioDetalle,
    );
    setLineas((prev) => [
      ...prev,
      {
        itemId: item.id,
        nombre: item.nombre,
        cantidad: cantidadNueva,
        precioUnitario: precio,
        stockDisponible: item.stock,
      },
    ]);
    setItemSeleccionado("");
    setCantidadNueva(1);
  }

  function quitarLinea(itemId: string) {
    setLineas((prev) => prev.filter((l) => l.itemId !== itemId));
  }

  function actualizarLinea(itemId: string, cambios: Partial<Pick<LineaForm, "cantidad" | "precioUnitario">>) {
    setLineas((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, ...cambios } : l)));
  }

  const total = lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);

  async function handleSubmit() {
    if (!clienteId) {
      setError("Elegí un cliente.");
      return;
    }
    if (lineas.length === 0) {
      setError("Agregá al menos un producto.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      const factura = await api.post<Factura>("/facturas", {
        clienteId,
        fechaVencimiento: fechaVencimiento || undefined,
        lineas: lineas.map((l) => ({
          itemId: l.itemId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
        })),
      });
      onCreated(factura);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la factura.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-abyss-900/5 px-6 py-5">
          <h2 className="font-display text-lg font-bold text-abyss-900">
            Nueva factura de venta
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Cliente
              </label>
              <div className="relative">
                <select
                  value={clienteId}
                  onChange={(e) => {
                    setClienteId(e.target.value);
                    setLineas([]);
                  }}
                  // appearance-none a propósito — sin esto, el navegador
                  // dibuja su propio widget nativo encima del estilo
                  // (se nota sobre todo en Windows/Firefox), y el borde
                  // y la flecha quedan sin pinta. El ChevronDown de acá
                  // abajo reemplaza la flecha nativa.
                  className={`${inputClase} w-full appearance-none pr-9`}
                >
                  <option value="">Seleccioná un cliente…</option>
                  {clientes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.tipoCliente === "mayorista" ? "mayorista" : "detalle"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Vencimiento (opcional)
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className={`${inputClase} w-full`}
              />
            </div>
          </div>

          <div className={!cliente ? "opacity-40" : ""}>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Agregar producto
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div
                className="relative min-w-0 w-full sm:flex-1"
                // min-w-0 a propósito: los nombres de producto son largos
                // ("Conejo Aquatics SET PECERAS CON AGARRADERA — stock:
                // 10"), y un hijo flex igual no se encoge por debajo de
                // ese ancho de contenido salvo que se lo permitamos
                // explícitamente — si no, empuja el botón "Agregar"
                // fuera del modal y queda cortado.
              >
                <select
                  disabled={!cliente}
                  value={itemSeleccionado}
                  onChange={(e) => setItemSeleccionado(e.target.value)}
                  className={`${inputClase} w-full appearance-none pr-9`}
                >
                  <option value="">
                    {items ? "Elegí un producto…" : "Cargando productos…"}
                  </option>
                  {itemsDisponibles.map((i) => (
                    <option key={i.id} value={i.id} disabled={i.stock === 0}>
                      {i.nombre} {i.stock === 0 ? "— sin stock" : `— stock: ${i.stock}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  disabled={!cliente}
                  value={cantidadNueva}
                  onChange={(e) => setCantidadNueva(Number(e.target.value))}
                  className={`${inputClase} w-20`}
                />
                <button
                  type="button"
                  disabled={!cliente || !itemSeleccionado}
                  onClick={agregarLinea}
                  className="flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-mist-100 px-3.5 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-200 disabled:opacity-40 sm:flex-initial"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
            </div>
            {!cliente && (
              <p className="mt-1.5 text-xs text-abyss-900/40">
                Elegí un cliente primero — el precio depende de si es detalle o mayoreo.
              </p>
            )}
          </div>

          {lineas.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-abyss-900/5">
              {/* overflow-x-auto + min-w en la tabla: en mobile (375px)
                  las 4 columnas más los inputs no entran — antes se
                  cortaban "Precio" y "Subtotal" sin forma de verlos. */}
              <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-abyss-900/5 bg-mist-50/60 text-xs font-semibold uppercase tracking-wide text-abyss-900/45">
                  <tr>
                    <th className="px-3.5 py-2">Producto</th>
                    <th className="px-3.5 py-2 text-center">Cant.</th>
                    <th className="px-3.5 py-2 text-right">Precio</th>
                    <th className="px-3.5 py-2 text-right">Subtotal</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-abyss-900/5">
                  {lineas.map((l) => (
                    <tr key={l.itemId}>
                      <td className="px-3.5 py-2 align-middle font-medium text-abyss-900">
                        {l.nombre}
                      </td>
                      <td className="px-3.5 py-2 align-middle text-center">
                        <input
                          type="number"
                          min={1}
                          max={l.stockDisponible}
                          value={l.cantidad}
                          onChange={(e) =>
                            actualizarLinea(l.itemId, { cantidad: Number(e.target.value) })
                          }
                          className="w-16 rounded-lg border border-abyss-900/10 px-2 py-1.5 text-center text-sm"
                        />
                      </td>
                      <td className="px-3.5 py-2 align-middle text-right">
                        <input
                          type="number"
                          min={0}
                          value={l.precioUnitario}
                          onChange={(e) =>
                            actualizarLinea(l.itemId, { precioUnitario: Number(e.target.value) })
                          }
                          className="w-24 rounded-lg border border-abyss-900/10 px-2 py-1.5 text-right text-sm"
                        />
                      </td>
                      <td className="px-3.5 py-2 text-right align-middle font-semibold text-abyss-900">
                        {formatColones(l.cantidad * l.precioUnitario)}
                      </td>
                      <td className="px-3.5 py-2 align-middle">
                        <button
                          type="button"
                          onClick={() => quitarLinea(l.itemId)}
                          className="flex items-center justify-center rounded-lg p-1.5 text-abyss-900/30 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-abyss-900/5 bg-mist-50/60 px-3.5 py-3">
                <span className="text-sm font-medium text-abyss-900/60">Total</span>
                <span className="font-display text-lg font-bold text-abyss-900">
                  {formatColones(total)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-abyss-900/5 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-abyss-900/10 px-4 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={guardando || !clienteId || lineas.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20 disabled:opacity-60"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear factura
          </button>
        </div>
      </div>
    </div>
  );
}
