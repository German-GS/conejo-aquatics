"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Fish, Menu, Search, ShoppingCart, X } from "lucide-react";
import { publico, type NodoCategoria } from "@/lib/api";
import { CuentaMenu } from "@/components/CuentaMenu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [secciones, setSecciones] = useState<NodoCategoria[]>([]);
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    publico
      .categorias()
      .then(setSecciones)
      .catch(() => setSecciones([]));
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(6,35,43,0.06)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-700 via-turquoise-500 to-seafoam-400 text-white shadow-md shadow-turquoise-500/30">
            <Fish className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span
            className="text-lg font-bold tracking-tight text-abyss-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Conejo <span className="text-turquoise-500">Aquatics</span>
          </span>
        </Link>

        <div
          className="hidden items-center gap-6 lg:flex"
          onMouseLeave={() => setDropdownAbierto(null)}
        >
          {secciones.map((seccion) => (
            <div key={seccion.id} className="relative">
              <a
                href={`#seccion-${seccion.slug}`}
                onMouseEnter={() => setDropdownAbierto(seccion.id)}
                className="flex items-center gap-1 py-2 text-sm font-medium text-abyss-900/70 transition-colors hover:text-turquoise-500"
              >
                {seccion.nombre}
                {seccion.hijos.length > 0 && <ChevronDown className="h-3.5 w-3.5" />}
              </a>

              {seccion.hijos.length > 0 && dropdownAbierto === seccion.id && (
                <div className="absolute left-1/2 top-full flex -translate-x-1/2 gap-8 rounded-2xl border border-abyss-900/5 bg-white p-5 shadow-xl shadow-abyss-950/10">
                  {seccion.hijos.map((sub) => (
                    <div key={sub.id} className="min-w-[140px]">
                      <a
                        href={`#seccion-${sub.slug}`}
                        className="block text-xs font-bold uppercase tracking-wide text-turquoise-500"
                      >
                        {sub.nombre}
                      </a>
                      {sub.hijos.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {sub.hijos.map((nieto) => (
                            <li key={nieto.id}>
                              <a
                                href={`#seccion-${nieto.slug}`}
                                className="text-sm text-abyss-900/65 hover:text-ocean-700"
                              >
                                {nieto.nombre}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a
            href="#mayoreo"
            className="text-sm font-medium text-abyss-900/70 transition-colors hover:text-turquoise-500"
          >
            Mayoreo
          </a>
        </div>

        <div className="hidden items-center gap-1.5 lg:flex">
          <button
            aria-label="Buscar"
            className="rounded-full p-2.5 text-abyss-900/70 transition-colors hover:bg-mist-100 hover:text-ocean-700"
          >
            <Search className="h-5 w-5" />
          </button>
          <CuentaMenu />
          <button
            aria-label="Carrito"
            className="relative rounded-full p-2.5 text-abyss-900/70 transition-colors hover:bg-mist-100 hover:text-ocean-700"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-seafoam-500 text-[10px] font-bold text-white">
              0
            </span>
          </button>
        </div>

        <button
          aria-label="Abrir menú"
          className="rounded-full p-2 text-abyss-900 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="max-h-[70vh] overflow-y-auto border-t border-abyss-900/5 bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {secciones.map((seccion) => (
              <div key={seccion.id}>
                <a
                  href={`#seccion-${seccion.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-abyss-900 hover:bg-mist-100"
                >
                  {seccion.nombre}
                </a>
                {seccion.hijos.map((sub) => (
                  <a
                    key={sub.id}
                    href={`#seccion-${sub.slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-6 py-2 text-sm text-abyss-900/70 hover:bg-mist-100"
                  >
                    {sub.nombre}
                  </a>
                ))}
              </div>
            ))}
            <a
              href="#mayoreo"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-abyss-900/80 hover:bg-mist-100"
            >
              Mayoreo
            </a>
            <div className="mt-2 border-t border-abyss-900/5 pt-3">
              <CuentaMenu variant="block" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
