import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  PERMISO_GRUPOS,
  PERMISO_LABELS,
  PERMISOS_POR_DEFECTO_ROL,
  ROL_LABELS,
  type Permiso,
  type RolUsuario,
} from "@/lib/permisos";

type PermisosResponse = {
  rol: RolUsuario;
  efectivos: Permiso[];
  overrides: { permiso: Permiso; concedido: boolean }[];
};

export function PermisosPanel({
  usuarioId,
  nombre,
  onClose,
}: {
  usuarioId: string;
  nombre: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<PermisosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<Permiso | null>(null);

  async function cargar() {
    try {
      const res = await api.get<PermisosResponse>(
        `/usuarios/${usuarioId}/permisos`,
      );
      setData(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los permisos.");
    }
  }

  useEffect(() => {
    cargar();
  }, [usuarioId]);

  async function toggle(permiso: Permiso, concedidoActual: boolean) {
    if (!data) return;
    setPendiente(permiso);
    setError(null);
    try {
      const res = await api.patch<PermisosResponse>(
        `/usuarios/${usuarioId}/permisos`,
        { permiso, concedido: !concedidoActual },
      );
      setData(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el permiso.");
    } finally {
      setPendiente(null);
    }
  }

  const defaultsDelRol = data ? PERMISOS_POR_DEFECTO_ROL[data.rol] : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-abyss-950/40">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-abyss-900/5 px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-bold text-abyss-900">
              Permisos
            </h2>
            <p className="text-sm text-abyss-900/55">
              {nombre}
              {data && (
                <span className="ml-1.5 rounded-full bg-mist-100 px-2 py-0.5 text-xs font-semibold text-abyss-900/60">
                  {ROL_LABELS[data.rol]}
                </span>
              )}
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
          {data?.rol === "administrador" ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-700 to-turquoise-500 text-white">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <p className="max-w-[220px] text-sm text-abyss-900/60">
                Los administradores siempre tienen todos los permisos — no
                se pueden restringir.
              </p>
            </div>
          ) : !data ? (
            <p className="text-sm text-abyss-900/50">Cargando…</p>
          ) : (
            <div className="space-y-6">
              {error && (
                <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}
              {PERMISO_GRUPOS.map((grupo) => (
                <div key={grupo.titulo}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-abyss-900/40">
                    {grupo.titulo}
                  </h3>
                  <div className="space-y-1">
                    {grupo.permisos.map((permiso) => {
                      const concedido = data.efectivos.includes(permiso);
                      const esDelRol = defaultsDelRol.includes(permiso);
                      return (
                        <label
                          key={permiso}
                          className="flex cursor-pointer items-start justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-mist-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-abyss-900">
                              {PERMISO_LABELS[permiso]}
                            </p>
                            {esDelRol && (
                              <p className="text-xs text-abyss-900/40">
                                Incluido por su rol
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            {pendiente === permiso && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-abyss-900/30" />
                            )}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={concedido}
                              disabled={pendiente !== null}
                              onClick={() => toggle(permiso, concedido)}
                              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                                concedido ? "bg-turquoise-500" : "bg-abyss-900/15"
                              }`}
                            >
                              <span
                                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                  concedido ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
