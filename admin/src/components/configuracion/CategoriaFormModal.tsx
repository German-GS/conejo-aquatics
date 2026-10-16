import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function CategoriaFormModal({
  modo,
  categoriaId,
  nombreActual,
  parentId,
  parentNombre,
  onClose,
  onSaved,
}: {
  modo: "crear" | "editar";
  categoriaId?: string;
  nombreActual?: string;
  parentId?: string | null;
  parentNombre?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(nombreActual ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (modo === "crear") {
        await api.post("/categorias", { nombre, parentId: parentId ?? undefined });
      } else {
        await api.patch(`/categorias/${categoriaId}`, { nombre });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la sección.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-abyss-900">
            {modo === "crear"
              ? parentNombre
                ? `Nueva subsección de "${parentNombre}"`
                : "Nueva sección"
              : "Renombrar"}
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
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Agua dulce"
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
            />
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
