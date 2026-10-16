import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { NodoCategoria } from "@/lib/categorias";
import { NodoCategoriaArbol } from "./NodoCategoriaArbol";
import { CategoriaFormModal } from "./CategoriaFormModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type ModalCrearEditar =
  | { tipo: "crear"; padre: NodoCategoria | null }
  | { tipo: "editar"; nodo: NodoCategoria };

export function SeccionesDelSitio() {
  const [arbol, setArbol] = useState<NodoCategoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalCrearEditar | null>(null);
  const [eliminar, setEliminar] = useState<NodoCategoria | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      setArbol(await api.get<NodoCategoria[]>("/categorias"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las secciones.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarEliminar() {
    if (!eliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await api.delete(`/categorias/${eliminar.id}`);
      setEliminar(null);
      cargar();
    } catch (err) {
      setErrorEliminar(err instanceof ApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-abyss-900">
            Secciones del sitio
          </h3>
          <p className="text-sm text-abyss-900/55">
            El navbar de la tienda en línea se arma con esto: las secciones
            de primer nivel son los menús, y sus subsecciones aparecen
            como submenú.
          </p>
        </div>
        <button
          onClick={() => setModal({ tipo: "crear", padre: null })}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Sección
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-abyss-900/5 bg-white p-3">
        {!arbol ? (
          <p className="px-3 py-4 text-sm text-abyss-900/40">Cargando…</p>
        ) : arbol.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-abyss-900/45">
            Todavía no hay secciones. Creá la primera con el botón de arriba.
          </p>
        ) : (
          arbol.map((nodo) => (
            <NodoCategoriaArbol
              key={nodo.id}
              nodo={nodo}
              nivel={0}
              onAgregarHija={(padre) => setModal({ tipo: "crear", padre })}
              onEditar={(nodo) => setModal({ tipo: "editar", nodo })}
              onEliminar={setEliminar}
            />
          ))
        )}
      </div>

      {modal?.tipo === "crear" && (
        <CategoriaFormModal
          modo="crear"
          parentId={modal.padre?.id ?? null}
          parentNombre={modal.padre?.nombre}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            cargar();
          }}
        />
      )}

      {modal?.tipo === "editar" && (
        <CategoriaFormModal
          modo="editar"
          categoriaId={modal.nodo.id}
          nombreActual={modal.nodo.nombre}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            cargar();
          }}
        />
      )}

      {eliminar && (
        <ConfirmDialog
          title={`¿Eliminar "${eliminar.nombre}"?`}
          message="Si tiene subsecciones o productos clasificados ahí, primero hay que moverlos."
          confirmLabel="Eliminar"
          loading={eliminando}
          error={errorEliminar}
          onConfirm={confirmarEliminar}
          onCancel={() => {
            setEliminar(null);
            setErrorEliminar(null);
          }}
        />
      )}
    </div>
  );
}
