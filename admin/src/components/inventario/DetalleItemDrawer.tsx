import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  Camera,
  CheckCircle2,
  ClipboardList,
  Loader2,
  PackagePlus,
  Skull,
  X,
} from "lucide-react";
import { api, ApiError, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatColones } from "@/lib/format";
import {
  ESTADO_LOTE_LABELS,
  ORIGEN_LOTE_ES_ACTIVO_BIOLOGICO,
  TIPO_ITEM_LABELS,
  TIPO_MOVIMIENTO_LABELS,
  type InventarioItem,
  type Lote,
  type MovimientoInventario,
} from "@/lib/inventario";
import { IngresarLoteModal } from "./IngresarLoteModal";
import { MortalidadModal } from "./MortalidadModal";
import { IngresoStockModal } from "./IngresoStockModal";
import { AjusteStockModal } from "./AjusteStockModal";

const ESTADO_BADGE: Record<string, string> = {
  cuarentena: "bg-amber-50 text-amber-600",
  disponible: "bg-seafoam-50 text-seafoam-600",
  agotado: "bg-mist-100 text-abyss-900/40",
};

export function DetalleItemDrawer({
  item,
  onClose,
  onChanged,
}: {
  item: InventarioItem;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { tienePermiso } = useAuth();
  const puedeCrear = tienePermiso("inventario.crear");
  const puedeEditar = tienePermiso("inventario.editar");

  const [itemActual, setItemActual] = useState(item);
  const [lotes, setLotes] = useState<Lote[] | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [modalLote, setModalLote] = useState(false);
  const [modalIngreso, setModalIngreso] = useState(false);
  const [modalAjuste, setModalAjuste] = useState(false);
  const [loteMortalidad, setLoteMortalidad] = useState<Lote | null>(null);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const esAnimal = itemActual.tipo === "animal_vivo";

  async function cargarTodo() {
    try {
      const [itemFresco, movs] = await Promise.all([
        api.get<InventarioItem>(`/inventario/${item.id}`),
        api.get<MovimientoInventario[]>(`/inventario/${item.id}/movimientos`),
      ]);
      setItemActual(itemFresco);
      setMovimientos(movs);
      if (esAnimal) {
        setLotes(await api.get<Lote[]>(`/inventario/${item.id}/lotes`));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el detalle.");
    }
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  function refrescar() {
    onChanged();
    cargarTodo();
  }

  async function subirFoto(archivo: File) {
    setSubiendoFoto(true);
    setError(null);
    try {
      const actualizado = await api.upload<InventarioItem>(
        `/inventario/${item.id}/imagen`,
        archivo,
      );
      setItemActual(actualizado);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir la foto.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function marcarDisponible(lote: Lote) {
    setAccionEnCurso(lote.id);
    setError(null);
    try {
      await api.post(`/inventario/lotes/${lote.id}/disponible`);
      refrescar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo pasar el lote a disponible.");
    } finally {
      setAccionEnCurso(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-abyss-950/40">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-abyss-900/5 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-abyss-900/40">
              {TIPO_ITEM_LABELS[itemActual.tipo]}
            </p>
            <h2 className="font-display text-lg font-bold text-abyss-900">
              {itemActual.nombre}
              {itemActual.codigo && (
                <span className="ml-1.5 text-sm font-normal text-abyss-900/40">
                  · {itemActual.codigo}
                </span>
              )}
            </h2>
            <div className="mt-1.5 flex items-center gap-3 text-sm text-abyss-900/60">
              <span>{formatColones(Number(itemActual.precioDetalle))} detalle</span>
              <span>·</span>
              <span>{formatColones(Number(itemActual.precioMayoreo))} mayoreo</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              disabled={!puedeEditar || subiendoFoto}
              className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mist-50 ring-1 ring-abyss-900/5 disabled:cursor-not-allowed"
            >
              {itemActual.imagenUrl ? (
                <img
                  src={`${API_URL}${itemActual.imagenUrl}`}
                  alt={itemActual.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-6 w-6 text-abyss-900/25" />
              )}
              {puedeEditar && (
                <span className="absolute inset-0 flex items-center justify-center bg-abyss-950/0 text-white opacity-0 transition-all group-hover:bg-abyss-950/50 group-hover:opacity-100">
                  {subiendoFoto ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </span>
              )}
            </button>
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) subirFoto(archivo);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-abyss-900/45">
              {puedeEditar
                ? "Click en la foto para subir o cambiarla. JPG, PNG, WEBP o GIF, máximo 5 MB."
                : "Foto del producto."}
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl bg-mist-50 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <Boxes className="h-4 w-4 text-abyss-900/40" />
              <span className="text-sm text-abyss-900/60">Stock actual</span>
            </div>
            <span className="text-lg font-bold text-abyss-900">
              {itemActual.stock}
              {itemActual.unidadMedida !== "unidad" && (
                <span className="ml-1 text-sm font-normal text-abyss-900/40">
                  {itemActual.unidadMedida}
                </span>
              )}
            </span>
          </div>

          {itemActual.descripcion && (
            <p className="mb-6 text-sm text-abyss-900/60">
              {itemActual.descripcion}
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          {esAnimal ? (
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-abyss-900">
                  Lotes
                </h3>
                {puedeCrear && (
                  <button
                    onClick={() => setModalLote(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-mist-50 px-2.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-mist-100"
                  >
                    <PackagePlus className="h-3.5 w-3.5" />
                    Ingresar lote
                  </button>
                )}
              </div>

              {!lotes ? (
                <p className="text-sm text-abyss-900/40">Cargando…</p>
              ) : lotes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-abyss-900/10 px-4 py-6 text-center text-sm text-abyss-900/45">
                  Todavía no hay lotes ingresados.
                </p>
              ) : (
                <div className="space-y-2">
                  {lotes.map((lote) => (
                    <div
                      key={lote.id}
                      className="rounded-xl border border-abyss-900/5 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-abyss-900">
                            {lote.numeroLote}
                            {lote.proveedor && (
                              <span className="ml-1.5 font-normal text-abyss-900/45">
                                · {lote.proveedor}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-abyss-900/45">
                            {lote.cantidadDisponible} de {lote.cantidadIngresada} disponibles
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              ORIGEN_LOTE_ES_ACTIVO_BIOLOGICO[lote.origen]
                                ? "bg-turquoise-50 text-turquoise-600"
                                : "bg-mist-100 text-abyss-900/45"
                            }`}
                          >
                            {lote.origen === "produccion_propia"
                              ? "Producción propia · NIIF 41"
                              : lote.origen === "compra_engorde"
                                ? "En engorde · NIIF 41"
                                : "Comprado · NIC 2"}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[lote.estado]}`}
                        >
                          {ESTADO_LOTE_LABELS[lote.estado]}
                        </span>
                      </div>

                      {puedeEditar && lote.estado !== "agotado" && (
                        <div className="mt-3 flex gap-2">
                          {lote.estado === "cuarentena" && (
                            <button
                              onClick={() => marcarDisponible(lote)}
                              disabled={accionEnCurso === lote.id}
                              className="flex items-center gap-1.5 rounded-lg bg-seafoam-50 px-2.5 py-1.5 text-xs font-semibold text-seafoam-600 hover:bg-seafoam-100 disabled:opacity-50"
                            >
                              {accionEnCurso === lote.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Marcar disponible
                            </button>
                          )}
                          <button
                            onClick={() => setLoteMortalidad(lote)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            <Skull className="h-3.5 w-3.5" />
                            Mortalidad
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-abyss-900">
                  Stock
                </h3>
                <div className="flex gap-2">
                  {puedeCrear && (
                    <button
                      onClick={() => setModalIngreso(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-mist-50 px-2.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-mist-100"
                    >
                      <PackagePlus className="h-3.5 w-3.5" />
                      Ingresar
                    </button>
                  )}
                  {puedeEditar && (
                    <button
                      onClick={() => setModalAjuste(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-mist-50 px-2.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-mist-100"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Ajustar
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-abyss-900/45">
                Mercancía general — sin lotes ni cuarentena.
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-3 font-display text-sm font-bold text-abyss-900">
              Movimientos
            </h3>
            {!movimientos ? (
              <p className="text-sm text-abyss-900/40">Cargando…</p>
            ) : movimientos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-abyss-900/10 px-4 py-6 text-center text-sm text-abyss-900/45">
                Sin movimientos todavía.
              </p>
            ) : (
              <div className="divide-y divide-abyss-900/5">
                {movimientos.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-abyss-900">
                        {TIPO_MOVIMIENTO_LABELS[m.tipo] ?? m.tipo}
                        {m.lote && (
                          <span className="text-abyss-900/40"> · {m.lote.numeroLote}</span>
                        )}
                      </p>
                      <p className="text-xs text-abyss-900/40">
                        {new Date(m.creadoEn).toLocaleString("es-CR")}
                        {m.creadoPor && ` · ${m.creadoPor.nombre}`}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        m.cantidad >= 0 ? "text-seafoam-600" : "text-red-500"
                      }`}
                    >
                      {m.cantidad >= 0 ? "+" : ""}
                      {m.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalLote && (
        <IngresarLoteModal
          itemId={item.id}
          onClose={() => setModalLote(false)}
          onSaved={() => {
            setModalLote(false);
            refrescar();
          }}
        />
      )}

      {modalIngreso && (
        <IngresoStockModal
          itemId={item.id}
          onClose={() => setModalIngreso(false)}
          onSaved={() => {
            setModalIngreso(false);
            refrescar();
          }}
        />
      )}

      {modalAjuste && (
        <AjusteStockModal
          itemId={item.id}
          stockActual={itemActual.stock}
          onClose={() => setModalAjuste(false)}
          onSaved={() => {
            setModalAjuste(false);
            refrescar();
          }}
        />
      )}

      {loteMortalidad && (
        <MortalidadModal
          loteId={loteMortalidad.id}
          numeroLote={loteMortalidad.numeroLote}
          cantidadDisponible={loteMortalidad.cantidadDisponible}
          onClose={() => setLoteMortalidad(null)}
          onSaved={() => {
            setLoteMortalidad(null);
            refrescar();
          }}
        />
      )}
    </div>
  );
}
