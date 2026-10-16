import { useEffect, useMemo, useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { InventarioItem } from "@/lib/inventario";
import type { NodoCategoria } from "@/lib/categorias";
import { ArbolCategoriasNav } from "@/components/catalogo/ArbolCategoriasNav";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { ItemFormModal } from "@/components/inventario/ItemFormModal";
import { DetalleItemDrawer } from "@/components/inventario/DetalleItemDrawer";

// Un producto clasificado en una sección "padre" (ej. "Seres vivos")
// también debe aparecer ahí, no solo en la subsección exacta a la que
// pertenece — por eso hace falta la lista de IDs de toda la rama.
function idsDeLaRama(nodo: NodoCategoria): string[] {
  return [nodo.id, ...nodo.hijos.flatMap(idsDeLaRama)];
}

export default function CatalogoPage() {
  const { tienePermiso } = useAuth();
  const puedeCrear = tienePermiso("inventario.crear");
  // Quien no tiene inventario.ver (ej. vendedor) igual puede navegar el
  // catálogo, pero con datos limitados (sin costo) y sin poder abrir el
  // detalle completo de cada producto — eso sí requiere inventario.ver.
  const puedeVerInventario = tienePermiso("inventario.ver");

  const [arbol, setArbol] = useState<NodoCategoria[] | null>(null);
  const [items, setItems] = useState<InventarioItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seleccionada, setSeleccionada] = useState<NodoCategoria | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemDetalle, setItemDetalle] = useState<InventarioItem | null>(null);

  async function cargar() {
    try {
      const [cats, prods] = await Promise.all([
        api.get<NodoCategoria[]>("/categorias"),
        api.get<InventarioItem[]>(
          puedeVerInventario ? "/inventario" : "/inventario/catalogo",
        ),
      ]);
      setArbol(cats);
      setItems(prods);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el catálogo.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const idsRamaSeleccionada = useMemo(
    () => (seleccionada ? new Set(idsDeLaRama(seleccionada)) : null),
    [seleccionada],
  );

  const itemsFiltrados = useMemo(() => {
    if (!items) return null;
    if (!idsRamaSeleccionada) return items;
    return items.filter(
      (item) => item.categoria && idsRamaSeleccionada.has(item.categoria.id),
    );
  }, [items, idsRamaSeleccionada]);

  const sinClasificarCount = items?.filter((i) => !i.categoria).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-abyss-900">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-abyss-900/55">
            Los mismos productos del inventario, agrupados por las
            secciones del sitio.
          </p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-2xl border border-abyss-900/5 bg-white p-3 lg:h-fit lg:sticky lg:top-6">
          <button
            onClick={() => setSeleccionada(null)}
            className={`mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              seleccionada === null
                ? "bg-turquoise-50 font-semibold text-ocean-700"
                : "font-medium text-abyss-900/70 hover:bg-mist-50"
            }`}
          >
            🗂️ Todas las secciones
          </button>
          {!arbol ? (
            <p className="px-3 py-4 text-sm text-abyss-900/40">Cargando…</p>
          ) : (
            arbol.map((nodo) => (
              <ArbolCategoriasNav
                key={nodo.id}
                nodo={nodo}
                nivel={0}
                seleccionadaId={seleccionada?.id ?? null}
                onSeleccionar={setSeleccionada}
              />
            ))
          )}
          {sinClasificarCount > 0 && (
            <p className="mt-2 border-t border-abyss-900/5 px-3 pt-2 text-xs text-abyss-900/40">
              {sinClasificarCount} sin clasificar
            </p>
          )}
        </div>

        <div>
          {!itemsFiltrados ? (
            <p className="px-1 py-10 text-center text-sm text-abyss-900/40">
              Cargando…
            </p>
          ) : itemsFiltrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-abyss-900/10 px-5 py-16 text-center">
              <Boxes className="h-8 w-8 text-abyss-900/20" />
              <p className="text-sm text-abyss-900/45">
                {seleccionada
                  ? "Todavía no hay productos clasificados en esta sección."
                  : "Todavía no hay nada en el inventario."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {itemsFiltrados.map((item) => (
                <ProductoCard
                  key={item.id}
                  item={item}
                  onClick={puedeVerInventario ? () => setItemDetalle(item) : () => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalAbierto && (
        <ItemFormModal
          onClose={() => setModalAbierto(false)}
          onSaved={() => {
            setModalAbierto(false);
            cargar();
          }}
        />
      )}

      {itemDetalle && (
        <DetalleItemDrawer
          item={itemDetalle}
          onClose={() => setItemDetalle(null)}
          onChanged={cargar}
        />
      )}
    </div>
  );
}
