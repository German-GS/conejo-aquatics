import { useState } from "react";
import { Bell, ChevronDown, KeyRound, LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CambiarPasswordModal } from "@/components/CambiarPasswordModal";

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { session, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const initials = (session?.nombre ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-abyss-900/5 bg-white/85 px-4 backdrop-blur-md sm:px-6">
      <button
        aria-label="Abrir menú"
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-abyss-900/60 hover:bg-mist-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
        <input
          type="search"
          placeholder="Buscar producto, lote, cliente…"
          className="w-full rounded-full border border-abyss-900/10 bg-mist-50 py-2 pl-9 pr-3.5 text-sm outline-none transition-colors placeholder:text-abyss-900/35 focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/15"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          aria-label="Notificaciones"
          className="relative rounded-full p-2.5 text-abyss-900/60 hover:bg-mist-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-seafoam-500 ring-2 ring-white" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm hover:bg-mist-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ocean-700 to-turquoise-500 text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-semibold text-abyss-900">
                {session?.nombre}
              </span>
              <span className="block text-[11px] text-abyss-900/45">
                {session?.rol}
              </span>
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-abyss-900/40 sm:block" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-abyss-900/5 bg-white py-1.5 shadow-xl shadow-abyss-950/10">
                <div className="px-3.5 py-2">
                  <p className="text-xs font-semibold text-abyss-900">
                    {session?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-abyss-900/70 hover:bg-mist-100"
                >
                  <KeyRound className="h-4 w-4" />
                  Cambiar contraseña
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {passwordModalOpen && (
        <CambiarPasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </header>
  );
}
