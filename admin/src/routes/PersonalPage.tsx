import { useEffect, useState } from "react";
import { KeyRound, KeySquare, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ROL_LABELS, type RolUsuario } from "@/lib/permisos";
import { NuevoUsuarioModal } from "@/components/personal/NuevoUsuarioModal";
import { EditarUsuarioModal } from "@/components/personal/EditarUsuarioModal";
import { PermisosPanel } from "@/components/personal/PermisosPanel";
import { ResetearPasswordModal } from "@/components/personal/ResetearPasswordModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
};

const ROL_BADGE: Record<RolUsuario, string> = {
  administrador: "bg-ocean-700/10 text-ocean-700",
  bodeguero: "bg-turquoise-500/10 text-turquoise-600",
  vendedor: "bg-seafoam-500/10 text-seafoam-600",
};

export default function PersonalPage() {
  const { session } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioPermisos, setUsuarioPermisos] = useState<Usuario | null>(null);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [usuarioResetPassword, setUsuarioResetPassword] = useState<Usuario | null>(null);
  const [usuarioEliminar, setUsuarioEliminar] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      const data = await api.get<Usuario[]>("/usuarios");
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el personal.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarEliminar() {
    if (!usuarioEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await api.delete(`/usuarios/${usuarioEliminar.id}`);
      setUsuarioEliminar(null);
      cargar();
    } catch (err) {
      setErrorEliminar(
        err instanceof ApiError ? err.message : "No se pudo eliminar el usuario.",
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-abyss-900">
            Personal
          </h1>
          <p className="mt-1 text-sm text-abyss-900/55">
            Cuentas del equipo, su rol y qué pueden hacer en el sistema.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20"
        >
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-abyss-900/5 bg-mist-50/60 text-xs font-semibold uppercase tracking-wide text-abyss-900/45">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Correo</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-abyss-900/5">
            {usuarios?.map((usuario) => {
              const esUsuarioActual = usuario.id === session?.id;
              return (
                <tr key={usuario.id} className="transition-colors hover:bg-mist-50/60">
                  <td className="flex items-center gap-2.5 px-5 py-3.5 font-medium text-abyss-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist-100 text-abyss-900/40">
                      <UserRound className="h-4 w-4" />
                    </span>
                    {usuario.nombre}
                    {esUsuarioActual && (
                      <span className="rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-semibold text-abyss-900/45">
                        Vos
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-abyss-900/60">{usuario.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROL_BADGE[usuario.rol]}`}
                    >
                      {ROL_LABELS[usuario.rol]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        usuario.activo
                          ? "bg-seafoam-50 text-seafoam-600"
                          : "bg-mist-100 text-abyss-900/40"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setUsuarioPermisos(usuario)}
                        title="Permisos"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                      >
                        <KeySquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setUsuarioEditar(usuario)}
                        title="Editar"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setUsuarioResetPassword(usuario)}
                        title="Resetear contraseña"
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setUsuarioEliminar(usuario)}
                        disabled={esUsuarioActual}
                        title={esUsuarioActual ? "No podés eliminar tu propia cuenta" : "Eliminar"}
                        className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-abyss-900/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {usuarios?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-abyss-900/45">
            Todavía no hay usuarios registrados.
          </p>
        )}
      </div>

      {modalAbierto && (
        <NuevoUsuarioModal
          onClose={() => setModalAbierto(false)}
          onCreated={() => {
            setModalAbierto(false);
            cargar();
          }}
        />
      )}

      {usuarioEditar && (
        <EditarUsuarioModal
          usuario={usuarioEditar}
          esUsuarioActual={usuarioEditar.id === session?.id}
          onClose={() => setUsuarioEditar(null)}
          onSaved={() => {
            setUsuarioEditar(null);
            cargar();
          }}
        />
      )}

      {usuarioEliminar && (
        <ConfirmDialog
          title={`¿Eliminar a ${usuarioEliminar.nombre}?`}
          message="Esta acción no se puede deshacer. La persona perderá acceso al sistema de inmediato."
          confirmLabel="Eliminar usuario"
          loading={eliminando}
          error={errorEliminar}
          onConfirm={confirmarEliminar}
          onCancel={() => {
            setUsuarioEliminar(null);
            setErrorEliminar(null);
          }}
        />
      )}

      {usuarioPermisos && (
        <PermisosPanel
          usuarioId={usuarioPermisos.id}
          nombre={usuarioPermisos.nombre}
          onClose={() => setUsuarioPermisos(null)}
        />
      )}

      {usuarioResetPassword && (
        <ResetearPasswordModal
          usuario={usuarioResetPassword}
          onClose={() => setUsuarioResetPassword(null)}
          onReset={() => setUsuarioResetPassword(null)}
        />
      )}
    </div>
  );
}
