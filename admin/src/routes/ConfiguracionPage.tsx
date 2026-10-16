import { useState } from "react";
import { Globe, Settings } from "lucide-react";
import { SeccionesDelSitio } from "@/components/configuracion/SeccionesDelSitio";
import { ProductosDestacados } from "@/components/configuracion/ProductosDestacados";
import { SitioConfigForm } from "@/components/configuracion/SitioConfigForm";

const TABS = [{ id: "pagina", label: "Página", icon: Globe }] as const;

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pagina");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-abyss-900">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-abyss-900/55">
          Ajustes generales del sistema.
        </p>
      </div>

      <div className="flex gap-6">
        <nav className="w-48 shrink-0 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-gradient-to-r from-ocean-700 to-turquoise-500 text-white shadow-sm"
                  : "text-abyss-900/65 hover:bg-mist-100"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-abyss-900/30">
            <Settings className="h-4 w-4" />
            Más próximamente
          </div>
        </nav>

        <div className="flex-1 space-y-10">
          {tab === "pagina" && (
            <>
              <SitioConfigForm />
              <SeccionesDelSitio />
              <ProductosDestacados />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
