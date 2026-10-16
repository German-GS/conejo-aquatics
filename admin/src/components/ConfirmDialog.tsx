import { Loader2, TriangleAlert } from "lucide-react";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  danger = true,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            danger ? "bg-red-50 text-red-600" : "bg-turquoise-50 text-turquoise-600"
          }`}
        >
          <TriangleAlert className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-base font-bold text-abyss-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-abyss-900/60">
          {message}
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-abyss-900/10 py-2.5 text-sm font-semibold text-abyss-900/70 hover:bg-mist-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-70 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-r from-ocean-700 to-turquoise-500"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
