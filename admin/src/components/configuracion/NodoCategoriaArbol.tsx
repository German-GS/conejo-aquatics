import { Pencil, Plus, Trash2 } from "lucide-react";
import type { NodoCategoria } from "@/lib/categorias";

export function NodoCategoriaArbol({
  nodo,
  nivel,
  onAgregarHija,
  onEditar,
  onEliminar,
}: {
  nodo: NodoCategoria;
  nivel: number;
  onAgregarHija: (padre: NodoCategoria) => void;
  onEditar: (nodo: NodoCategoria) => void;
  onEliminar: (nodo: NodoCategoria) => void;
}) {
  return (
    <div style={{ marginLeft: nivel * 20 }}>
      <div className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-mist-50">
        <span className="text-sm font-medium text-abyss-900">
          {nivel === 0 ? "📁 " : "› "}
          {nodo.nombre}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onAgregarHija(nodo)}
            title="Agregar subsección"
            className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEditar(nodo)}
            title="Renombrar"
            className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-mist-100 hover:text-ocean-700"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEliminar(nodo)}
            title="Eliminar"
            className="rounded-lg p-1.5 text-abyss-900/40 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {nodo.hijos.length > 0 && (
        <div className="border-l border-abyss-900/10 pl-1">
          {nodo.hijos.map((hijo) => (
            <NodoCategoriaArbol
              key={hijo.id}
              nodo={hijo}
              nivel={nivel + 1}
              onAgregarHija={onAgregarHija}
              onEditar={onEditar}
              onEliminar={onEliminar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
