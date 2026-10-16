import { useEffect, useState } from "react";
import { Boxes, Eye, FileSpreadsheet, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { api, ApiError, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatColones } from "@/lib/format";
import { TIPO_ITEM_LABELS, type InventarioItem } from "@/lib/inventario";
import { ItemFormModal } from "@/components/inventario/ItemFormModal";
import { DetalleItemDrawer } from "@/components/inventario/DetalleItemDrawer";
import { ImportarExcelModal } from "@/components/inventario/ImportarExcelModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function InventarioPage() {
  const { tienePermiso } = useAuth();
  const puedeCrear = tienePermiso("inventario.crear");
  const puedeEditar = tienePermiso("inventario.editar");
  const puedeEliminar = tienePermiso("inventario.eliminar");

  const [items, setItems] = useState<InventarioItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [importarAbierto, setImportarAbierto] = useState(false);
  const [itemDetalle, setItemDetalle] = useState<InventarioItem | null>(null);
  const [itemEditar, setItemEditar] = useState<InventarioItem | null>(null);
  const [itemEliminar, setItemEliminar] = useState<InventarioItem | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      const data = await api.get<InventarioItem[]>("/inventario");
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el inventario.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarEliminar() {
    if (!itemEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await api.delete(`/inventario/${itemEliminar.id}`);
      setItemEliminar(null);
      cargar();
    } catch (err) {
      setErrorEliminar(
        err instanceof ApiError ? err.message : "No se pudo eliminar el ítem.",
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-abyss-900">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-abyss-900/55">
            Animales vivos y mercancía general, con precio de detalle y mayoreo.
          </p>
        </div>
        {puedeCrear && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setImportarAbierto(true)}
              className="flex items-center gap-2 rounded-xl border border-abyss-900/10 px-4 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-100"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importar desde Excel
            </button>
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-abyss-900/5 bg-mist-50/60 text-xs font-semibold uppercase tracking-wide text-abyss-900/45">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Precio detalle</th>
              <th className="px-5 py-3">Precio mayoreo</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-abyss-900/5">
            {items?.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-mist-50/60">
                <td className="flex items-center gap-2.5 px-5 py-3.5 font-medium text-abyss-900">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist-100 text-abyss-900/40">
                    {item.imagenUrl ? (
                      <img
                        src={`${API_URL}${item.imagenUrl}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Boxes className="h-4 w-4" />
                    )}
                  </span>
                  <span>
                    {item.nombre}
                    {item.codigo && (
                      <span className="block text-xs font-normal text-abyss-900/40">
                        {item.codigo}
                      </span>
                    )}
                  </span>
                  {item.destacado && (
                    <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" />
                  )}
                </td>
                <td className="px-5 py-3.5 text-abyss-900/55">
                  {item.categoria?.nombre ?? (
                    <span className="text-abyss-900/30">Sin clasificar</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.tipo === "animal_vivo"
                        ? "bg-seafoam-500/10 text-seafoam-600"
                        : "bg-ocean-700/10 text-ocean-700"
                    }`}
                  >
                    {TIPO_ITEM_LABELS[item.tipo]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-abyss-900/70">
                  {formatColones(Number(item.precioDetalle))}
                </td>
                <td className="px-5 py-3.5 text-abyss-900/70">
                  {formatColones(Number(item.precioMayoreo))}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`font-semibold ${
                      item.stock === 0 ? "text-red-500" : "text-abyss-900/80"
                    }`}
                  >
                    {item.stock}
                    {item.unidadMedida !== "unidad" && (
                      <span className="ml-1 font-normal text-abyss-900/40">
                        {item.unidadMedida}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setItemDetalle(item)}
                      title="Ver detalle"
                      className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {puedeEditar && (
                      <button
                        onClick={() => setItemEditar(item)}
                        title="Editar"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {puedeEliminar && (
                      <button
                        onClick={() => setItemEliminar(item)}
                        title="Eliminar"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {items?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <Boxes className="h-8 w-8 text-abyss-900/20" />
            <p className="text-sm text-abyss-900/45">
              Todavía no hay nada en el inventario.
            </p>
          </div>
        )}

        {!puedeEliminar && items && items.length > 0 && (
          <p className="border-t border-abyss-900/5 bg-mist-50/60 px-5 py-2.5 text-xs text-abyss-900/40">
            No tenés permiso para eliminar ítems del inventario — pedile a un
            administrador que te lo autorice si lo necesitás.
          </p>
        )}
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

      {importarAbierto && (
        <ImportarExcelModal
          onClose={() => setImportarAbierto(false)}
          onImportado={() => {
            setImportarAbierto(false);
            cargar();
          }}
        />
      )}

      {itemEditar && (
        <ItemFormModal
          item={itemEditar}
          onClose={() => setItemEditar(null)}
          onSaved={() => {
            setItemEditar(null);
            cargar();
          }}
        />
      )}

      {itemEliminar && (
        <ConfirmDialog
          title={`¿Eliminar "${itemEliminar.nombre}"?`}
          message="Esta acción no se puede deshacer."
          confirmLabel="Eliminar ítem"
          loading={eliminando}
          error={errorEliminar}
          onConfirm={confirmarEliminar}
          onCancel={() => {
            setItemEliminar(null);
            setErrorEliminar(null);
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
