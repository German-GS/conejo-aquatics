import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  accent: "ocean" | "turquoise" | "seafoam" | "amber";
}) {
  const accents: Record<string, string> = {
    ocean: "from-ocean-700 to-ocean-600",
    turquoise: "from-turquoise-500 to-turquoise-400",
    seafoam: "from-seafoam-500 to-seafoam-400",
    amber: "from-amber-500 to-amber-400",
  };

  return (
    <div className="rounded-2xl border border-abyss-900/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${accents[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        {delta && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              delta.positive
                ? "bg-seafoam-50 text-seafoam-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-abyss-900">{value}</p>
      <p className="mt-1 text-sm text-abyss-900/55">{label}</p>
    </div>
  );
}
