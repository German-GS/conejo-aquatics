"use client";

import { motion } from "framer-motion";
import { FileCheck2, QrCode, ShieldCheck, Wallet } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Cuarentena verificada",
    desc: "Cada lote pasa observación antes de estar disponible para la venta.",
  },
  {
    icon: QrCode,
    title: "Trazabilidad por lote",
    desc: "Sabemos el origen de cada animal, no solo la cantidad en stock.",
  },
  {
    icon: FileCheck2,
    title: "Factura electrónica",
    desc: "Comprobante electrónico ante Hacienda en cada compra, detalle o mayoreo.",
  },
  {
    icon: Wallet,
    title: "Precios en colones",
    desc: "Todo el catálogo con precios claros en ₡, sin sorpresas.",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-abyss-900/5 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-700 to-turquoise-500 text-white shadow-md">
              <v.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-bold text-abyss-900">
              {v.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-abyss-900/60">
              {v.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
