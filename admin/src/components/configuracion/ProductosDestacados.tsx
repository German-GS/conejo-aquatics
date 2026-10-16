import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatColones } from "@/lib/format";
import type { InventarioItem } from "@/lib/inventario";

export function ProductosDestacados() {
  const [items, setItems] = useState<InventarioItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<string | null>(null);

  async function cargar() {
    try {
      setItems(await api.get<InventarioItem[]>("/inventario"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el inventario.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function alternar(item: InventarioItem) {
    setPendiente(item.id);
    setError(null);
    try {
      await api.patch(`/inventario/${item.id}`, { destacado: !item.destacado });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar.");
    } finally {
      setPendiente(null);
    }
  }

  const destacadosCount = items?.filter((i) => i.destacado).length ?? 0;

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-display text-base font-bold text-abyss-900">
          Productos destacados
        </h3>
        <p className="text-sm text-abyss-900/55">
          Lo que marqués acá aparece en la sección "Destacados" de la
          página de inicio de la tienda en línea
          {destacadosCount > 0 && ` — ${destacadosCount} ahora mismo`}.
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white">
        {!items ? (
          <p className="px-4 py-6 text-sm text-abyss-900/40">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-abyss-900/45">
            Todavía no hay productos en el inventario.
          </p>
        ) : (
          <div className="divide-y divide-abyss-900/5">
            {items.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-mist-50/60"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      item.destacado
                        ? "bg-amber-50 text-amber-500"
                        : "bg-mist-100 text-abyss-900/30"
                    }`}
                  >
                    <Star className="h-4 w-4" fill={item.destacado ? "currentColor" : "none"} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-abyss-900">{item.nombre}</p>
                    <p className="text-xs text-abyss-900/45">
                      {formatColones(Number(item.precioDetalle))}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.destacado}
                  disabled={pendiente === item.id}
                  onClick={() => alternar(item)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                    item.destacado ? "bg-turquoise-500" : "bg-abyss-900/15"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      item.destacado ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
