import { Boxes, Star } from "lucide-react";
import { API_URL } from "@/lib/api";
import { formatColones } from "@/lib/format";
import { TIPO_ITEM_LABELS, type InventarioItem } from "@/lib/inventario";

export function ProductoCard({
  item,
  onClick,
}: {
  item: InventarioItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-abyss-900/5 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-mist-50">
        {item.imagenUrl ? (
          <img
            src={`${API_URL}${item.imagenUrl}`}
            alt={item.nombre}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-abyss-900/20">
            <Boxes className="h-10 w-10" />
          </div>
        )}
        {item.destacado && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
            <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
          </span>
        )}
        {item.stock === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-abyss-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <span
          className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            item.tipo === "animal_vivo"
              ? "bg-seafoam-500/10 text-seafoam-600"
              : "bg-ocean-700/10 text-ocean-700"
          }`}
        >
          {TIPO_ITEM_LABELS[item.tipo]}
        </span>

        <p className="text-sm font-semibold leading-snug text-abyss-900">
          {item.nombre}
        </p>
        {item.codigo && (
          <p className="text-xs text-abyss-900/40">{item.codigo}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-sm font-bold text-abyss-900">
              {formatColones(Number(item.precioDetalle))}
            </p>
            <p className="text-xs text-abyss-900/45">
              {formatColones(Number(item.precioMayoreo))} mayoreo
            </p>
          </div>
          <p
            className={`text-xs font-semibold ${
              item.stock === 0 ? "text-red-500" : "text-abyss-900/60"
            }`}
          >
            {item.stock}
            {item.unidadMedida !== "unidad" && ` ${item.unidadMedida}`}
          </p>
        </div>
      </div>
    </button>
  );
}
