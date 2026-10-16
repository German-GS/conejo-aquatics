"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Fish, Leaf, ShoppingBasket, Sparkles, Waves } from "lucide-react";
import { publico, type NodoCategoria } from "@/lib/api";

const ICONOS = [Fish, Waves, Leaf, Droplets, ShoppingBasket, Sparkles];
const DEGRADADOS = [
  ["from-ocean-700", "to-ocean-600"],
  ["from-turquoise-500", "to-turquoise-400"],
  ["from-seafoam-500", "to-seafoam-400"],
  ["from-ocean-600", "to-turquoise-500"],
  ["from-turquoise-400", "to-seafoam-400"],
];

// El navbar muestra el árbol completo; acá en la home mostramos un
// segundo nivel más "hojeable" — las subsecciones si las hay, o la
// sección misma si todavía no tiene subsecciones creadas.
function categoriasParaMostrar(arbol: NodoCategoria[]): NodoCategoria[] {
  return arbol.flatMap((seccion) =>
    seccion.hijos.length > 0 ? seccion.hijos : [seccion],
  );
}

export function Categories() {
  const [categorias, setCategorias] = useState<NodoCategoria[] | null>(null);

  useEffect(() => {
    publico
      .categorias()
      .then((arbol) => setCategorias(categoriasParaMostrar(arbol)))
      .catch(() => setCategorias([]));
  }, []);

  if (categorias !== null && categorias.length === 0) return null;

  return (
    <section id="categorias" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-turquoise-500">
            Categorías
          </p>
          <h2
            className="mt-2 text-3xl font-bold text-abyss-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Encontrá lo que tu acuario necesita
          </h2>
        </div>
        <a
          href="#catalogo"
          className="text-sm font-semibold text-ocean-700 underline-offset-4 hover:underline"
        >
          Ver catálogo completo →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(categorias ?? Array.from({ length: 5 })).map((cat, i) => {
          const Icono = ICONOS[i % ICONOS.length];
          const [from, to] = DEGRADADOS[i % DEGRADADOS.length];
          return (
            <motion.a
              key={cat?.id ?? i}
              href={cat ? `#seccion-${cat.slug}` : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl bg-mist-50 p-5 ring-1 ring-abyss-900/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-ocean-900/10"
            >
              {cat ? (
                <>
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${from} ${to} text-white shadow-md`}
                  >
                    <Icono className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-abyss-900">
                    {cat.nombre}
                  </h3>
                </>
              ) : (
                <div className="h-11 w-11 animate-pulse rounded-xl bg-mist-100" />
              )}
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
