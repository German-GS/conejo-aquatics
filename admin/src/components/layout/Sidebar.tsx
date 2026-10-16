import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  FileText,
  Fish,
  Globe,
  Home,
  IdCard,
  Landmark,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Permiso } from "@/lib/permisos";

const NAV: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  soloAdmin?: boolean;
  permiso?: Permiso;
}[] = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/pos", label: "Punto de venta", icon: ShoppingCart, permiso: "pos.vender" },
  { to: "/inventario", label: "Inventario", icon: Boxes, permiso: "inventario.ver" },
  { to: "/catalogo", label: "Catálogo", icon: Tags },
  { to: "/clientes", label: "Clientes", icon: Users, permiso: "clientes.gestionar" },
  { to: "/tienda-web", label: "Tienda en línea", icon: Globe, permiso: "clientes.gestionar" },
  { to: "/personal", label: "Personal", icon: IdCard, soloAdmin: true },
  { to: "/informes", label: "Informes", icon: BarChart3, permiso: "informes.ver" },
  { to: "/facturacion", label: "Facturación", icon: FileText, permiso: "facturacion.gestionar" },
  { to: "/contabilidad", label: "Contabilidad", icon: Landmark, permiso: "contabilidad.ver" },
];

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { session, tienePermiso } = useAuth();
  const esAdmin = session?.rol === "administrador";
  const items = NAV.filter(
    (item) =>
      (!item.soloAdmin || esAdmin) && (!item.permiso || tienePermiso(item.permiso)),
  );
  const puedeConfigurar = tienePermiso("catalogo.gestionar");

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-abyss-950/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-abyss-900/5 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-700 via-turquoise-500 to-seafoam-400 text-white">
              <Fish className="h-[18px] w-[18px]" strokeWidth={2.4} />
            </span>
            <span className="font-display text-[15px] font-bold text-abyss-900">
              Conejo <span className="text-turquoise-500">Aquatics</span>
            </span>
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-abyss-900/50 hover:bg-mist-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-ocean-700 to-turquoise-500 text-white shadow-sm shadow-turquoise-500/20"
                    : "text-abyss-900/65 hover:bg-mist-100 hover:text-abyss-900"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {puedeConfigurar && (
          <div className="border-t border-abyss-900/5 p-3">
            <NavLink
              to="/configuracion"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-mist-100 text-abyss-900"
                    : "text-abyss-900/55 hover:bg-mist-100 hover:text-abyss-900"
                }`
              }
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={2.1} />
              Configuración
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
