import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ORIGENES_LOTE, ORIGEN_LOTE_LABELS, type OrigenLote } from "@/lib/inventario";

export function IngresarLoteModal({
  itemId,
  onClose,
  onSaved,
}: {
  itemId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [cantidadIngresada, setCantidadIngresada] = useState("");
  const [origen, setOrigen] = useState<OrigenLote>("compra");
  const [proveedor, setProveedor] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [diasCuarentena, setDiasCuarentena] = useState("7");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const esProduccionPropia = origen === "produccion_propia";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(`/inventario/${itemId}/lotes`, {
        cantidadIngresada: Number(cantidadIngresada),
        origen,
        proveedor:
          esProduccionPropia || proveedor === "" ? undefined : proveedor,
        costoUnitario: Number(costoUnitario),
        diasCuarentenaRecomendados:
          diasCuarentena === "" ? undefined : Number(diasCuarentena),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo ingresar el lote.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-abyss-900">
            Ingresar lote
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
              Cantidad que ingresa
            </label>
            <input
              required
              type="number"
              min={1}
              step="1"
              value={cantidadIngresada}
              onChange={(e) => setCantidadIngresada(e.target.value)}
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Origen
            </label>
            <div className="space-y-1.5">
              {ORIGENES_LOTE.map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => setOrigen(o)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    origen === o
                      ? "border-turquoise-500 bg-turquoise-50 text-ocean-700"
                      : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
                  }`}
                >
                  {ORIGEN_LOTE_LABELS[o]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-abyss-900/40">
              Para Contabilidad: solo "comprado, listo para vender" es
              inventario ordinario (NIC 2) — los otros dos son activo
              biológico (NIIF 41), porque todavía van a crecer acá.
            </p>
          </div>

          {!esProduccionPropia && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Proveedor
              </label>
              <input
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                {esProduccionPropia ? "Valor razonable (₡)" : "Costo unitario (₡)"}
              </label>
              <input
                required
                type="number"
                min={0}
                step="1"
                value={costoUnitario}
                onChange={(e) => setCostoUnitario(e.target.value)}
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Días de cuarentena
              </label>
              <input
                type="number"
                min={1}
                step="1"
                value={diasCuarentena}
                onChange={(e) => setDiasCuarentena(e.target.value)}
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              />
            </div>
          </div>

          <p className="rounded-lg bg-mist-50 px-3.5 py-2.5 text-xs text-abyss-900/50">
            El lote entra en cuarentena y no se puede vender hasta que
            alguien lo marque como disponible.
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-abyss-900/10 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
