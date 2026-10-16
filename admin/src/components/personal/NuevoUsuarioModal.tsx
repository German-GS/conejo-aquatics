import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ROL_LABELS, ROLES, type RolUsuario } from "@/lib/permisos";

export function NuevoUsuarioModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("vendedor");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/usuarios", { nombre, email, password, rol });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el usuario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-abyss-900">
            Nuevo usuario
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
              Nombre completo
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              placeholder="Nombre y apellido"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Correo
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              placeholder="usuario@conejoaquatics.cr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Contraseña temporal
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
              Rol dentro de la empresa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRol(r)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                    rol === r
                      ? "border-turquoise-500 bg-turquoise-50 text-ocean-700"
                      : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
                  }`}
                >
                  {ROL_LABELS[r]}
                </button>
              ))}
            </div>
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
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
