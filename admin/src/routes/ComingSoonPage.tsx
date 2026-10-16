import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

export default function ComingSoonPage({
  title,
  icon: Icon = Construction,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-abyss-900/10 bg-white/60 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-700 to-turquoise-500 text-white shadow-md">
        <Icon className="h-6 w-6" />
      </span>
      <h1 className="font-display mt-5 text-xl font-bold text-abyss-900">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-abyss-900/55">
        Este módulo todavía no está construido — vamos por partes siguiendo
        el diseño del sistema.
      </p>
    </div>
  );
}
