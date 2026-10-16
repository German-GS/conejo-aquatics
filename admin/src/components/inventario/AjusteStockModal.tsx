import { useState, type FormEvent } from "react";
import { ClipboardList, Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

type Motivo = "merma" | "conteo";

export function AjusteStockModal({
  itemId,
  stockActual,
  onClose,
  onSaved,
}: {
  itemId: string;
  stockActual: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [signo, setSigno] = useState<"resta" | "suma">("resta");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState<Motivo>("merma");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const valor = Number(cantidad) * (signo === "resta" ? -1 : 1);
      await api.post(`/inventario/${itemId}/ajuste`, { cantidad: valor, motivo });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo ajustar el stock.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ClipboardList className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-abyss-900">
            Ajustar stock
          </h2>
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSigno("resta")}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                signo === "resta"
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
              }`}
            >
              − Quitar
            </button>
            <button
              type="button"
              onClick={() => setSigno("suma")}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                signo === "suma"
                  ? "border-seafoam-500 bg-seafoam-50 text-seafoam-600"
                  : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
              }`}
            >
              + Agregar
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Cantidad
            </label>
            <input
              required
              type="number"
              min={1}
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
            />
            <p className="mt-1.5 text-xs text-abyss-900/40">
              Stock actual: {stockActual}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Motivo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMotivo("merma")}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                  motivo === "merma"
                    ? "border-turquoise-500 bg-turquoise-50 text-ocean-700"
                    : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
                }`}
              >
                Merma / daño
              </button>
              <button
                type="button"
                onClick={() => setMotivo("conteo")}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                  motivo === "conteo"
                    ? "border-turquoise-500 bg-turquoise-50 text-ocean-700"
                    : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
                }`}
              >
                Conteo físico
              </button>
            </div>
          </div>

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
              Ajustar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
