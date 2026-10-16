export type NodoCategoria = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  hijos: NodoCategoria[];
};

export type OpcionCategoria = { id: string; etiqueta: string; nivel: number };

// Convierte el árbol en una lista plana con indentación, para un <select>
// simple: "Seres vivos", "— Agua dulce", "—— Peces".
export function aplanarArbol(
  nodos: NodoCategoria[],
  nivel = 0,
): OpcionCategoria[] {
  return nodos.flatMap((nodo) => [
    {
      id: nodo.id,
      etiqueta: `${"— ".repeat(nivel)}${nodo.nombre}`,
      nivel,
    },
    ...aplanarArbol(nodo.hijos, nivel + 1),
  ]);
}
