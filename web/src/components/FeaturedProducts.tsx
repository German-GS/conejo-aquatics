"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Plus, Sparkles } from "lucide-react";
import { formatColones } from "@/lib/format";
import { publico, urlImagen, type ProductoPublico } from "@/lib/api";

export function FeaturedProducts() {
  const [productos, setProductos] = useState<ProductoPublico[] | null>(null);

  useEffect(() => {
    publico
      .destacados()
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  if (productos !== null && productos.length === 0) return null;

  return (
    <section id="catalogo" className="bg-mist-50/60 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-turquoise-500 to-seafoam-400 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-turquoise-500">
              Recién llegados
            </p>
            <h2
              className="text-3xl font-bold text-abyss-900 sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Destacados de esta semana
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {(productos ?? Array.from({ length: 6 })).map((product, i) => (
            <motion.div
              key={product?.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-abyss-900/5 transition-shadow hover:shadow-xl hover:shadow-ocean-900/10"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-mist-100 to-turquoise-100/40 text-5xl">
                {!product ? (
                  <div className="h-full w-full animate-pulse bg-mist-100" />
                ) : (
                  <>
                    {product.tipo === "animal_vivo" && (
                      <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-seafoam-600 ring-1 ring-seafoam-500/20">
                        <Leaf className="h-2.5 w-2.5" /> Vivo
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-abyss-900/80 px-2.5 py-1 text-[10px] font-bold text-white">
                        Agotado
                      </span>
                    )}
                    {urlImagen(product.imagenUrl) ? (
                      <img
                        src={urlImagen(product.imagenUrl)!}
                        alt={product.nombre}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <span className="transition-transform group-hover:scale-110">
                        {product.tipo === "animal_vivo" ? "🐠" : "📦"}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                {product ? (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-abyss-900/40">
                      {product.categoria?.nombre ?? ""}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold leading-snug text-abyss-900">
                      {product.nombre}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-ocean-700">
                        {formatColones(Number(product.precioDetalle))}
                      </span>
                      <button
                        aria-label={`Agregar ${product.nombre} al carrito`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-abyss-900 text-white transition-colors hover:bg-turquoise-500"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="h-2.5 w-16 animate-pulse rounded bg-mist-100" />
                    <div className="h-3 w-24 animate-pulse rounded bg-mist-100" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
