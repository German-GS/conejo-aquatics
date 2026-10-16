import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Clock,
  FileText,
  Receipt,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";
import { formatColones } from "@/lib/format";
import type { Permiso } from "@/lib/permisos";
import type { Factura } from "@/lib/facturas";
import type { InventarioItem, LoteEnCuarentena } from "@/lib/inventario";
import type { Cliente } from "@/lib/clientes";

const UMBRAL_STOCK_BAJO = 5;

const ACCESOS_RAPIDOS: {
  label: string;
  icon: typeof FileText;
  to: string;
  permiso?: Permiso;
}[] = [
  { label: "Nueva factura", icon: FileText, to: "/facturacion", permiso: "facturacion.gestionar" },
  { label: "Ingresar lote", icon: Boxes, to: "/inventario", permiso: "inventario.ver" },
  { label: "Agregar producto", icon: Tags, to: "/catalogo" },
  { label: "Ver clientes", icon: Users, to: "/clientes", permiso: "clientes.gestionar" },
];

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function diasDesde(fechaISO: string): number {
  return Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86_400_000);
}

export default function DashboardPage() {
  const { session, tienePermiso } = useAuth();
  const puedeFacturacion = tienePermiso("facturacion.gestionar");
  const puedeInventario = tienePermiso("inventario.ver");
  const puedeClientes = tienePermiso("clientes.gestionar");

  const [facturas, setFacturas] = useState<Factura[] | null>(null);
  const [items, setItems] = useState<InventarioItem[] | null>(null);
  const [lotesCuarentena, setLotesCuarentena] = useState<LoteEnCuarentena[] | null>(null);
  const [clientes, setClientes] = useState<Cliente[] | null>(null);

  useEffect(() => {
    if (puedeFacturacion) {
      api.get<Factura[]>("/facturas").then(setFacturas).catch(() => setFacturas([]));
    }
    if (puedeInventario) {
      api.get<InventarioItem[]>("/inventario").then(setItems).catch(() => setItems([]));
      api
        .get<LoteEnCuarentena[]>("/inventario/lotes/cuarentena")
        .then(setLotesCuarentena)
        .catch(() => setLotesCuarentena([]));
    }
    if (puedeClientes) {
      api.get<Cliente[]>("/clientes").then(setClientes).catch(() => setClientes([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accesosVisibles = ACCESOS_RAPIDOS.filter(
    (a) => !a.permiso || tienePermiso(a.permiso),
  );
  const primerNombre = session?.nombre?.split(/[.\s]/)[0] ?? "";
  const hoy = new Date().toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { ventasHoy, deltaVentas, facturasPorCobrar } = useMemo(() => {
    if (!facturas) return { ventasHoy: 0, deltaVentas: null, facturasPorCobrar: 0 };
    const hoyStr = hoyISO();
    const ayerStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const sumarTotal = (lista: Factura[]) =>
      lista.reduce((acc, f) => acc + Number(f.total), 0);
    const totalHoy = sumarTotal(facturas.filter((f) => f.fechaEmision === hoyStr));
    const totalAyer = sumarTotal(facturas.filter((f) => f.fechaEmision === ayerStr));
    const delta =
      totalAyer > 0
        ? { value: `${Math.round(((totalHoy - totalAyer) / totalAyer) * 100)}%`, positive: totalHoy >= totalAyer }
        : null;
    return {
      ventasHoy: totalHoy,
      deltaVentas: delta,
      facturasPorCobrar: facturas.filter((f) => f.estadoCobro === "por_cobrar").length,
    };
  }, [facturas]);

  const stockBajo = useMemo(
    () => items?.filter((i) => i.stock > 0 && i.stock <= UMBRAL_STOCK_BAJO).length ?? 0,
    [items],
  );

  const mayoristas = useMemo(
    () => clientes?.filter((c) => c.tipoCliente === "mayorista").length ?? 0,
    [clientes],
  );

  const hayKpis = puedeFacturacion || puedeInventario;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold capitalize text-abyss-900">
          Hola, {primerNombre} 👋
        </h1>
        <p className="mt-1 text-sm capitalize text-abyss-900/55">{hoy}</p>
      </div>

      {hayKpis && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {puedeFacturacion && (
            <>
              <StatCard
                icon={Wallet}
                label="Ventas de hoy"
                value={facturas ? formatColones(ventasHoy) : "—"}
                delta={deltaVentas ?? undefined}
                accent="turquoise"
              />
              <StatCard
                icon={Receipt}
                label="Facturas por cobrar"
                value={facturas ? String(facturasPorCobrar) : "—"}
                accent="ocean"
              />
            </>
          )}
          {puedeInventario && (
            <>
              <StatCard
                icon={Clock}
                label="Lotes en cuarentena"
                value={lotesCuarentena ? String(lotesCuarentena.length) : "—"}
                accent="seafoam"
              />
              <StatCard
                icon={AlertTriangle}
                label="Productos con stock bajo"
                value={items ? String(stockBajo) : "—"}
                delta={stockBajo > 0 ? { value: "revisar", positive: false } : undefined}
                accent="amber"
              />
            </>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {puedeInventario && (
          <div className="rounded-2xl border border-abyss-900/5 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-abyss-900">
                Lotes próximos a salir de cuarentena
              </h2>
              <Link
                to="/inventario"
                className="text-xs font-semibold text-ocean-700 hover:underline"
              >
                Ver inventario →
              </Link>
            </div>

            {!lotesCuarentena ? (
              <p className="mt-4 text-sm text-abyss-900/40">Cargando…</p>
            ) : lotesCuarentena.length === 0 ? (
              <p className="mt-4 text-sm text-abyss-900/45">
                No hay ningún lote en cuarentena ahora mismo.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-abyss-900/5">
                {lotesCuarentena.slice(0, 5).map((l) => {
                  const dias = diasDesde(l.fechaIngreso);
                  const listo =
                    l.diasCuarentenaRecomendados != null &&
                    dias >= l.diasCuarentenaRecomendados;
                  return (
                    <div key={l.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-abyss-900">
                          {l.item.nombre}
                        </p>
                        <p className="text-xs text-abyss-900/45">
                          Lote {l.numeroLote} · ingresó hace {dias}{" "}
                          {dias === 1 ? "día" : "días"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          listo
                            ? "bg-seafoam-50 text-seafoam-600"
                            : "bg-mist-100 text-abyss-900/50"
                        }`}
                      >
                        {listo ? "Listo para pasar a disponible" : "En observación"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={puedeInventario ? "" : "lg:col-span-3"}>
          <div className="rounded-2xl border border-abyss-900/5 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-abyss-900">
              Accesos rápidos
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {accesosVisibles.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="group flex flex-col items-start gap-2.5 rounded-xl border border-abyss-900/5 bg-mist-50 p-3.5 transition-colors hover:border-turquoise-500/30 hover:bg-turquoise-50/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ocean-700 shadow-sm ring-1 ring-abyss-900/5 group-hover:text-turquoise-500">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold leading-snug text-abyss-900">
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>

            {puedeClientes && (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-mist-50 p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ocean-700 shadow-sm ring-1 ring-abyss-900/5">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-abyss-900">
                    {clientes ? `${mayoristas} clientes mayoristas` : "Cargando…"}
                  </p>
                  <p className="text-[11px] text-abyss-900/45">
                    {clientes ? `${clientes.length} clientes en total` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
