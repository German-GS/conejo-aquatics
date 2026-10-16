"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import type { SitioConfig } from "@/lib/api";

export function WholesaleBanner({ config }: { config: SitioConfig }) {
  return (
    <section id="mayoreo" className="px-5 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-abyss-900 via-ocean-700 to-turquoise-600 px-8 py-14 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-turquoise-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-seafoam-400/20 blur-3xl" />

        <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20">
          <Building2 className="h-6 w-6" />
        </span>
        <h2
          className="relative mt-5 text-2xl font-bold text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {config.bannerMayoreoTitulo}
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-mist-100/80 sm:text-base">
          {config.bannerMayoreoSubtitulo}
        </p>
        <a
          href="#"
          className="group relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ocean-800 shadow-lg transition-transform hover:scale-[1.03]"
        >
          {config.bannerMayoreoCtaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </motion.div>
    </section>
  );
}
