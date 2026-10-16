import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ROL_LABELS, ROLES, type RolUsuario } from "@/lib/permisos";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
};

export function EditarUsuarioModal({
  usuario,
  esUsuarioActual,
  onClose,
  onSaved,
}: {
  usuario: Usuario;
  esUsuarioActual: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [email, setEmail] = useState(usuario.email);
  const [rol, setRol] = useState<RolUsuario>(usuario.rol);
  const [activo, setActivo] = useState(usuario.activo);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.patch(`/usuarios/${usuario.id}`, { nombre, email, rol, activo });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar los cambios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-abyss-900">
            Editar usuario
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
                  disabled={esUsuarioActual}
                  onClick={() => setRol(r)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    rol === r
                      ? "border-turquoise-500 bg-turquoise-50 text-ocean-700"
                      : "border-abyss-900/10 bg-mist-50 text-abyss-900/60 hover:bg-mist-100"
                  }`}
                >
                  {ROL_LABELS[r]}
                </button>
              ))}
            </div>
            {esUsuarioActual && (
              <p className="mt-1.5 text-xs text-abyss-900/40">
                No podés cambiar tu propio rol.
              </p>
            )}
          </div>

          <label className="flex items-center justify-between rounded-xl bg-mist-50 px-3.5 py-3">
            <div>
              <p className="text-sm font-medium text-abyss-900">Cuenta activa</p>
              <p className="text-xs text-abyss-900/45">
                Si la desactivás, no va a poder iniciar sesión.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={activo}
              disabled={esUsuarioActual}
              onClick={() => setActivo((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                activo ? "bg-turquoise-500" : "bg-abyss-900/15"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  activo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

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
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
