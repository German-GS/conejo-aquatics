"use client";

import { motion } from "framer-motion";
import { ArrowRight, PackageSearch, ShieldCheck, Store, Truck } from "lucide-react";
import { Bubbles } from "./Bubbles";
import type { SitioConfig } from "@/lib/api";

const BADGES = [
  { icon: ShieldCheck, label: "Cuarentena garantizada" },
  { icon: Store, label: "Retiro en tienda" },
  { icon: Truck, label: "Envíos en el GAM" },
  { icon: PackageSearch, label: "Mayoreo con factura" },
];

export function Hero({ config }: { config: SitioConfig }) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-abyss-950 via-ocean-700 to-turquoise-500">
      <Bubbles />

      {/* luz submarina */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-turquoise-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-seafoam-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-turquoise-200 ring-1 ring-white/15 backdrop-blur">
              {config.heroInsignia}
            </span>

            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {config.heroTitulo}
              <br />
              <span className="bg-gradient-to-r from-turquoise-300 via-seafoam-300 to-turquoise-300 bg-clip-text text-transparent text-shimmer">
                {config.heroTituloDestacado}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist-100/80">
              {config.heroSubtitulo}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#catalogo"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ocean-800 shadow-lg shadow-abyss-950/30 transition-transform hover:scale-[1.03] active:scale-95"
              >
                {config.heroCta1Label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#mayoreo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/20"
              >
                {config.heroCta2Label}
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-turquoise-200 ring-1 ring-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium leading-snug text-mist-100/80">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-white/10 ring-1 ring-white/20 backdrop-blur-sm" />
            <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-ocean-600/60 via-turquoise-500/40 to-seafoam-400/40 shadow-inner" />
            <FishScene />
          </motion.div>
        </div>
      </div>

      <svg
        className="relative block w-full text-white"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,80 L0,80 Z"
        />
      </svg>
    </section>
  );
}

function FishScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="sway text-8xl drop-shadow-xl">🐠</div>
      <div
        className="sway absolute left-10 top-16 text-4xl opacity-90 drop-shadow-lg"
        style={{ animationDelay: "0.6s" }}
      >
        🐟
      </div>
      <div
        className="sway absolute bottom-16 right-8 text-5xl opacity-90 drop-shadow-lg"
        style={{ animationDelay: "1.2s" }}
      >
        🐡
      </div>
      <div
        className="sway absolute bottom-10 left-16 text-3xl opacity-80"
        style={{ animationDelay: "0.3s" }}
      >
        🌿
      </div>
    </div>
  );
}
