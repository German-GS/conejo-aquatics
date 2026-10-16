import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, ChevronDown, Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  TIPO_ITEM_LABELS,
  TIPOS_ITEM,
  UNIDADES_MEDIDA,
  UNIDAD_MEDIDA_LABELS,
  type InventarioItem,
  type TipoItem,
  type UnidadMedida,
} from "@/lib/inventario";
import { aplanarArbol, type NodoCategoria } from "@/lib/categorias";

const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024;

export function ItemFormModal({
  item,
  onClose,
  onSaved,
}: {
  item?: InventarioItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editando = !!item;

  const [nombre, setNombre] = useState(item?.nombre ?? "");
  const [codigo, setCodigo] = useState(item?.codigo ?? "");
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? "");
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedida>(
    item?.unidadMedida ?? "unidad",
  );
  const [tipo, setTipo] = useState<TipoItem>(item?.tipo ?? "animal_vivo");
  const [precioDetalle, setPrecioDetalle] = useState(item?.precioDetalle ?? "");
  const [precioMayoreo, setPrecioMayoreo] = useState(item?.precioMayoreo ?? "");
  const [costoUnitario, setCostoUnitario] = useState(item?.costoUnitario ?? "");
  const [categoriaId, setCategoriaId] = useState(item?.categoria?.id ?? "");
  const [opcionesCategoria, setOpcionesCategoria] = useState<
    ReturnType<typeof aplanarArbol> | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Solo aplica al crear: la foto necesita el id del ítem, así que se sube
  // justo después de crearlo. Si esa subida falla, guardamos el ítem ya
  // creado acá para que un reintento no lo vuelva a crear por duplicado.
  const [creado, setCreado] = useState<InventarioItem | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<NodoCategoria[]>("/categorias")
      .then((arbol) => setOpcionesCategoria(aplanarArbol(arbol)))
      .catch(() => setOpcionesCategoria([]));
  }, []);

  useEffect(() => {
    if (!foto) {
      setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  function elegirFoto(archivo: File | undefined) {
    if (!archivo) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(archivo.type)) {
      setError("Solo se aceptan imágenes (JPG, PNG, WEBP, GIF).");
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO) {
      setError("La foto no puede pesar más de 5 MB.");
      return;
    }
    setError(null);
    setFoto(archivo);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let itemId = editando ? item.id : creado?.id;

      if (!itemId) {
        const body = {
          nombre,
          codigo: codigo.trim() === "" ? undefined : codigo.trim(),
          descripcion: descripcion.trim() === "" ? undefined : descripcion.trim(),
          unidadMedida,
          tipo,
          precioDetalle: Number(precioDetalle),
          precioMayoreo: Number(precioMayoreo),
          costoUnitario: costoUnitario === "" ? undefined : Number(costoUnitario),
          categoriaId: categoriaId === "" ? undefined : categoriaId,
        };
        const nuevo = await api.post<InventarioItem>("/inventario", body);
        setCreado(nuevo);
        itemId = nuevo.id;
      } else if (editando) {
        const body = {
          nombre,
          codigo: codigo.trim() === "" ? undefined : codigo.trim(),
          descripcion: descripcion.trim() === "" ? undefined : descripcion.trim(),
          unidadMedida,
          tipo,
          precioDetalle: Number(precioDetalle),
          precioMayoreo: Number(precioMayoreo),
          costoUnitario: costoUnitario === "" ? undefined : Number(costoUnitario),
          categoriaId: categoriaId === "" ? null : categoriaId,
        };
        await api.patch(`/inventario/${item.id}`, body);
      }

      if (foto && itemId) {
        await api.upload(`/inventario/${itemId}/imagen`, foto);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el ítem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-abyss-900">
            {editando ? "Editar ítem" : "Agregar al inventario"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Nombre
            </label>
            <input
              required
              disabled={!!creado}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Betta macho, cola de velo"
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Código
            </label>
            <input
              disabled={!!creado}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Opcional — ej. BET-COL-01"
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Descripción
            </label>
            <textarea
              disabled={!!creado}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Opcional — detalles de color, tamaño, cuidados, etc."
              rows={2}
              className="w-full resize-none rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_ITEM.map((t) => (
                <button
                  type="button"
                  key={t}
                  disabled={editando || !!creado}
                  onClick={() => setTipo(t)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    tipo === t
                      ? "border-turquoise-500 bg-turquoise-50 text-ocean-700"
                      : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
                  }`}
                >
                  {TIPO_ITEM_LABELS[t]}
                </button>
              ))}
            </div>
            {editando && (
              <p className="mt-1.5 text-xs text-abyss-900/40">
                El tipo no se puede cambiar una vez creado el ítem.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Unidad de medida
            </label>
            <div className="relative">
              <select
                disabled={!!creado}
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value as UnidadMedida)}
                className="w-full appearance-none rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 pr-9 text-sm text-abyss-900 outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
              >
                {UNIDADES_MEDIDA.map((u) => (
                  <option key={u} value={u}>
                    {UNIDAD_MEDIDA_LABELS[u]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Precio detalle (₡)
              </label>
              <input
                required
                disabled={!!creado}
                type="number"
                min={1}
                step="1"
                value={precioDetalle}
                onChange={(e) => setPrecioDetalle(e.target.value)}
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Precio mayoreo (₡)
              </label>
              <input
                required
                disabled={!!creado}
                type="number"
                min={1}
                step="1"
                value={precioMayoreo}
                onChange={(e) => setPrecioMayoreo(e.target.value)}
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Costo unitario (₡)
            </label>
            <input
              disabled={!!creado}
              type="number"
              min={0}
              step="1"
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(e.target.value)}
              placeholder="Opcional"
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Sección del sitio
            </label>
            <div className="relative">
              <select
                disabled={!!creado}
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 pr-9 text-sm text-abyss-900 outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20 disabled:opacity-60"
              >
                <option value="">Sin clasificar</option>
                {opcionesCategoria?.map((opcion) => (
                  <option key={opcion.id} value={opcion.id}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
            </div>
            <p className="mt-1.5 text-xs text-abyss-900/40">
              Define dónde aparece en el navbar de la tienda en línea —
              se administran en Configuración → Página.
            </p>
          </div>

          {!editando && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Foto
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => inputFotoRef.current?.click()}
                className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mist-50 ring-1 ring-abyss-900/5"
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-abyss-900/25" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-abyss-950/0 text-white opacity-0 transition-all group-hover:bg-abyss-950/50 group-hover:opacity-100">
                  <Camera className="h-5 w-5" />
                </span>
              </button>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => elegirFoto(e.target.files?.[0])}
              />
              <div className="text-xs text-abyss-900/50">
                <p>JPG, PNG, WEBP o GIF — hasta 5 MB.</p>
                {foto && (
                  <button
                    type="button"
                    onClick={() => setFoto(null)}
                    className="mt-1 font-semibold text-ocean-700 hover:underline"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>
          )}

          {!editando && (
            <p className="rounded-lg bg-mist-50 px-3.5 py-2.5 text-xs text-abyss-900/50">
              {creado
                ? "El ítem ya se creó — reintentá para guardar la foto."
                : "El ítem se crea con stock 0 — después de guardarlo, entrá a \"Ver detalle\" para ingresar el primer lote o stock."}
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={creado ? onSaved : onClose}
              className="flex-1 rounded-xl border border-abyss-900/10 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-100"
            >
              {creado ? "Continuar sin foto" : "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {creado ? "Guardar foto" : editando ? "Guardar cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
