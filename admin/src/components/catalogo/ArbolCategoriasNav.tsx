import type { NodoCategoria } from "@/lib/categorias";

// Versión de solo navegación del árbol de secciones (la versión editable
// con agregar/renombrar/eliminar vive en Configuración → Página). Acá
// solo sirve para filtrar qué productos se muestran.
export function ArbolCategoriasNav({
  nodo,
  nivel,
  seleccionadaId,
  onSeleccionar,
}: {
  nodo: NodoCategoria;
  nivel: number;
  seleccionadaId: string | null;
  onSeleccionar: (nodo: NodoCategoria) => void;
}) {
  const activa = nodo.id === seleccionadaId;

  return (
    <div style={{ marginLeft: nivel * 14 }}>
      <button
        onClick={() => onSeleccionar(nodo)}
        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          activa
            ? "bg-turquoise-50 font-semibold text-ocean-700"
            : "font-medium text-abyss-900/70 hover:bg-mist-50"
        }`}
      >
        {nivel === 0 ? "📁 " : "› "}
        {nodo.nombre}
      </button>

      {nodo.hijos.length > 0 && (
        <div className="border-l border-abyss-900/10 pl-1">
          {nodo.hijos.map((hijo) => (
            <ArbolCategoriasNav
              key={hijo.id}
              nodo={hijo}
              nivel={nivel + 1}
              seleccionadaId={seleccionadaId}
              onSeleccionar={onSeleccionar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
