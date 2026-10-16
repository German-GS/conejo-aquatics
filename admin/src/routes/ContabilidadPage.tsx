import { useEffect, useState } from "react";
import { BookOpen, Landmark } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatColones } from "@/lib/format";
import {
  TIPO_CUENTA_LABELS,
  type AsientoContable,
  type CuentaContable,
  type TipoCuenta,
} from "@/lib/contabilidad";

const ORDEN_TIPOS: TipoCuenta[] = ["activo", "pasivo", "patrimonio", "ingreso", "gasto"];

export default function ContabilidadPage() {
  const [cuentas, setCuentas] = useState<CuentaContable[] | null>(null);
  const [asientos, setAsientos] = useState<AsientoContable[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"cuentas" | "asientos">("cuentas");

  useEffect(() => {
    Promise.all([
      api.get<CuentaContable[]>("/contabilidad/cuentas"),
      api.get<AsientoContable[]>("/contabilidad/asientos"),
    ])
      .then(([c, a]) => {
        setCuentas(c);
        setAsientos(a);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudo cargar contabilidad."),
      );
  }, []);

  const cuentasPorTipo = ORDEN_TIPOS.map((tipo) => ({
    tipo,
    cuentas: (cuentas ?? []).filter((c) => c.tipo === tipo),
  })).filter((grupo) => grupo.cuentas.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-abyss-900">Contabilidad</h1>
        <p className="mt-1 text-sm text-abyss-900/55">
          Catálogo de cuentas y asientos generados automáticamente por cada
          movimiento de inventario — seres vivos clasificados según NIC 2
          (comprados) o NIIF 41 (producción propia).
        </p>
      </div>

      <div className="flex gap-1.5 rounded-full bg-mist-100 p-1 w-fit">
        <button
          onClick={() => setTab("cuentas")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "cuentas" ? "bg-white text-ocean-700 shadow-sm" : "text-abyss-900/55"
          }`}
        >
          <Landmark className="h-4 w-4" />
          Catálogo de cuentas
        </button>
        <button
          onClick={() => setTab("asientos")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "asientos" ? "bg-white text-ocean-700 shadow-sm" : "text-abyss-900/55"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Asientos
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
      )}

      {tab === "cuentas" && (
        <div className="space-y-6">
          {!cuentas ? (
            <p className="text-sm text-abyss-900/40">Cargando…</p>
          ) : (
            cuentasPorTipo.map((grupo) => (
              <div
                key={grupo.tipo}
                className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white shadow-sm"
              >
                <div className="border-b border-abyss-900/5 bg-mist-50/60 px-5 py-3">
                  <h2 className="font-display text-sm font-bold text-abyss-900">
                    {TIPO_CUENTA_LABELS[grupo.tipo]}
                  </h2>
                </div>
                <div className="divide-y divide-abyss-900/5">
                  {grupo.cuentas.map((cuenta) => (
                    <div
                      key={cuenta.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-abyss-900">
                          {cuenta.codigo} — {cuenta.nombre}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-abyss-900">
                        {formatColones(cuenta.saldo)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "asientos" && (
        <div className="overflow-hidden rounded-2xl border border-abyss-900/5 bg-white shadow-sm">
          {!asientos ? (
            <p className="px-5 py-6 text-sm text-abyss-900/40">Cargando…</p>
          ) : asientos.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-abyss-900/45">
              Todavía no hay asientos registrados.
            </p>
          ) : (
            <div className="divide-y divide-abyss-900/5">
              {asientos.map((asiento) => (
                <div key={asiento.id} className="px-5 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-abyss-900">
                      {asiento.descripcion}
                    </p>
                    <p className="text-xs text-abyss-900/40">
                      {new Date(asiento.fecha).toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {asiento.lineas.map((linea) => (
                      <div
                        key={linea.id}
                        className="flex items-center justify-between text-xs text-abyss-900/60"
                      >
                        <span>
                          {linea.cuenta.codigo} — {linea.cuenta.nombre}
                        </span>
                        <span className="font-mono">
                          {Number(linea.debe) > 0
                            ? `Debe ${formatColones(Number(linea.debe))}`
                            : `Haber ${formatColones(Number(linea.haber))}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
