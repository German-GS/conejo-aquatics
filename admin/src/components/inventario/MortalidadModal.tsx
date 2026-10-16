import { useState, type FormEvent } from "react";
import { Loader2, Skull, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function MortalidadModal({
  loteId,
  numeroLote,
  cantidadDisponible,
  onClose,
  onSaved,
}: {
  loteId: string;
  numeroLote: string;
  cantidadDisponible: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(`/inventario/lotes/${loteId}/mortalidad`, {
        cantidad: Number(cantidad),
      });
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo registrar la mortalidad.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Skull className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-abyss-900">
              Registrar mortalidad
            </h2>
            <p className="text-xs text-abyss-900/45">Lote {numeroLote}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Cantidad
            </label>
            <input
              required
              type="number"
              min={1}
              max={cantidadDisponible}
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
            />
            <p className="mt-1.5 text-xs text-abyss-900/40">
              Disponibles en este lote: {cantidadDisponible}
            </p>
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
