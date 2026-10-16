import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatColones } from "@/lib/format";
import type {
  FilaPrevisualizada,
  PrevisualizacionImportacion,
  ResumenImportacion,
} from "@/lib/importacion";

type Paso = "subir" | "revisar" | "resultado";

export function ImportarExcelModal({
  onClose,
  onImportado,
}: {
  onClose: () => void;
  onImportado: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [paso, setPaso] = useState<Paso>("subir");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previsualizacion, setPrevisualizacion] =
    useState<PrevisualizacionImportacion | null>(null);
  const [excluidas, setExcluidas] = useState<Set<string>>(new Set());
  const [resultado, setResultado] = useState<ResumenImportacion | null>(null);

  async function handleArchivo(archivo: File) {
    setError(null);
    setCargando(true);
    try {
      const prev = await api.upload<PrevisualizacionImportacion>(
        "/inventario/importar/previsualizar",
        archivo,
        "archivo",
      );
      setPrevisualizacion(prev);
      // Las filas con conflicto (código ya usado) arrancan excluidas —
      // el resto entra por defecto.
      setExcluidas(new Set(prev.filas.filter((f) => f.conflicto).map((f) => f.codigo)));
      setPaso("revisar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo leer el archivo.");
    } finally {
      setCargando(false);
    }
  }

  function alternar(codigo: string) {
    setExcluidas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  }

  async function confirmar() {
    if (!previsualizacion) return;
    const filas = previsualizacion.filas.filter((f) => !excluidas.has(f.codigo));
    if (filas.length === 0) {
      setError("No queda ninguna fila seleccionada para importar.");
      return;
    }
    setError(null);
    setCargando(true);
    try {
      const res = await api.post<ResumenImportacion>("/inventario/importar/confirmar", {
        filas,
      });
      setResultado(res);
      setPaso("resultado");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar la importación.");
    } finally {
      setCargando(false);
    }
  }

  const filasIncluidas =
    previsualizacion?.filas.filter((f) => !excluidas.has(f.codigo)).length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-abyss-900/5 px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-bold text-abyss-900">
              Importar desde Excel
            </h2>
            <p className="text-sm text-abyss-900/55">
              Carga masiva de mercancía general a partir de un catálogo en .xlsx.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          {paso === "subir" && (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const archivo = e.dataTransfer.files[0];
                if (archivo) handleArchivo(archivo);
              }}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-abyss-900/15 bg-mist-50 px-6 py-16 text-center transition-colors hover:border-turquoise-500/40 hover:bg-turquoise-50/30"
            >
              {cargando ? (
                <Loader2 className="h-9 w-9 animate-spin text-ocean-700" />
              ) : (
                <FileSpreadsheet className="h-9 w-9 text-abyss-900/30" />
              )}
              <div>
                <p className="text-sm font-semibold text-abyss-900">
                  {cargando ? "Leyendo el archivo…" : "Hacé clic o arrastrá tu archivo .xlsx acá"}
                </p>
                <p className="mt-1 text-xs text-abyss-900/45">
                  Columnas esperadas: Categoría, Marca, Código, Modelo, Descripción, P.
                  Costo, P. Venta.
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo) handleArchivo(archivo);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {paso === "revisar" && previsualizacion && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-mist-50 p-3.5">
                  <p className="text-xl font-bold text-abyss-900">
                    {previsualizacion.totalFilas}
                  </p>
                  <p className="text-xs text-abyss-900/50">Filas leídas</p>
                </div>
                <div className="rounded-xl bg-mist-50 p-3.5">
                  <p className="text-xl font-bold text-abyss-900">
                    {previsualizacion.categorias.length}
                  </p>
                  <p className="text-xs text-abyss-900/50">Secciones nuevas</p>
                </div>
                <div className="rounded-xl bg-mist-50 p-3.5">
                  <p className="text-xl font-bold text-abyss-900">{filasIncluidas}</p>
                  <p className="text-xs text-abyss-900/50">Se van a crear</p>
                </div>
              </div>

              <p className="rounded-lg bg-turquoise-50 px-3.5 py-2.5 text-xs text-ocean-700">
                Todo entra como <strong>mercancía general</strong>, sin stock (₡0
                unidades — lo ingresás después por lote) y con{" "}
                <strong>precio público en ₡0</strong> porque el archivo no lo trae — el
                costo y el precio de mayoreo sí quedan cargados. Las categorías del
                Excel se crean como subsecciones dentro de una sección nueva
                "Mercancías generales".
              </p>

              {previsualizacion.totalConflictos > 0 && (
                <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {previsualizacion.totalConflictos} fila(s) tienen un código que ya
                  existe en el inventario — vienen destildadas, revisalas abajo.
                </p>
              )}

              <div className="overflow-hidden rounded-xl border border-abyss-900/5">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="sticky top-0 border-b border-abyss-900/5 bg-mist-50 text-xs font-semibold uppercase tracking-wide text-abyss-900/45">
                      <tr>
                        <th className="w-10 px-3 py-2" />
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2">Sección</th>
                        <th className="px-3 py-2 text-right">Costo</th>
                        <th className="px-3 py-2 text-right">Mayoreo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-abyss-900/5">
                      {previsualizacion.filas.map((f: FilaPrevisualizada) => (
                        <tr
                          key={f.codigo}
                          className={excluidas.has(f.codigo) ? "opacity-40" : ""}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={!excluidas.has(f.codigo)}
                              onChange={() => alternar(f.codigo)}
                              className="h-4 w-4 rounded accent-turquoise-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-abyss-900">{f.nombre}</p>
                            <p className="text-xs text-abyss-900/40">
                              {f.codigo}
                              {f.conflicto && " · código ya existe"}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-abyss-900/60">
                            {f.categoriaExcel}
                          </td>
                          <td className="px-3 py-2 text-right text-abyss-900/60">
                            {f.costoUnitario != null ? formatColones(f.costoUnitario) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-abyss-900">
                            {formatColones(f.precioMayoreo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {paso === "resultado" && resultado && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-seafoam-50 text-seafoam-600">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="text-lg font-bold text-abyss-900">
                {resultado.creados} producto(s) importado(s)
              </p>
              {resultado.categoriasCreadas.length > 0 && (
                <p className="max-w-md text-sm text-abyss-900/55">
                  Secciones nuevas: {resultado.categoriasCreadas.join(", ")}
                </p>
              )}
              {resultado.omitidos.length > 0 && (
                <div className="mt-2 w-full max-w-md rounded-lg bg-amber-50 px-3.5 py-2.5 text-left text-xs text-amber-700">
                  <p className="mb-1 font-semibold">
                    {resultado.omitidos.length} omitido(s):
                  </p>
                  {resultado.omitidos.slice(0, 8).map((o) => (
                    <p key={o.codigo}>
                      {o.codigo} — {o.motivo}
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-2 max-w-sm text-sm text-abyss-900/45">
                Ahora completá el precio público y el stock de cada producto desde
                Inventario o Catálogo.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-abyss-900/5 px-6 py-4">
          {paso === "revisar" && (
            <>
              <button
                onClick={onClose}
                className="rounded-xl border border-abyss-900/10 px-4 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmar}
                disabled={cargando || filasIncluidas === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20 disabled:opacity-60"
              >
                {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
                <Upload className="h-4 w-4" />
                Importar {filasIncluidas} producto(s)
              </button>
            </>
          )}
          {paso === "resultado" && (
            <button
              onClick={onImportado}
              className="rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20"
            >
              Listo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
