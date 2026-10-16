import { useState, type FormEvent } from "react";
import { Check, KeyRound, Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function CambiarPasswordModal({ onClose }: { onClose: () => void }) {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (passwordNueva !== confirmar) {
      setError("La confirmación no coincide con la contraseña nueva.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/password", { passwordActual, passwordNueva });
      setListo(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-700 to-turquoise-500 text-white">
              <KeyRound className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-abyss-900">
              Cambiar contraseña
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-abyss-900/40 hover:bg-mist-100"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {listo ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-seafoam-50 text-seafoam-600">
              <Check className="h-5 w-5" />
            </span>
            <p className="text-sm text-abyss-900/70">
              Tu contraseña se cambió correctamente.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 py-2.5 text-sm font-semibold text-white"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Contraseña actual
              </label>
              <input
                required
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Contraseña nueva
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
                Confirmar contraseña nueva
              </label>
              <input
                required
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
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
                Cambiar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
